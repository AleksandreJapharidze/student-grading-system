import request from "supertest";
import app from "../app";
import { AppDataSource } from "../config/type-orm-config";

const teacherCredentials = {
    email: "test-teacher-email@email.com",
    password: "test-password",
};
const studentCredentials = {
    email: "test-student-email@email.com",
    password: "test-password",
};

const assignmentId = 1;
const submissionId = 2;

let teacherToken = "";
let studentToken = "";

beforeAll(async () => {
    await AppDataSource.initialize();

    const teacherResponse = await request(app)
        .post("/api/auth/login")
        .send(teacherCredentials);
    teacherToken = teacherResponse.body.token;

    const studentResponse = await request(app)
        .post("/api/auth/login")
        .send(studentCredentials);
    studentToken = studentResponse.body.token;
});

afterAll(async () => {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
});

describe("Auth endpoints", () => {
    it("logs in the teacher successfully", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send(teacherCredentials);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Login successful");
        expect(response.body).toHaveProperty("token");
    });

    it("logs in the student successfully", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send(studentCredentials);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Login successful");
        expect(response.body).toHaveProperty("token");
    });
});

describe("Assignment grading", () => {
    it("grades an assignment submission with a teacher token", async () => {
        const response = await request(app)
            .patch(`/api/assignments/${assignmentId}/submissions/${submissionId}/grade`)
            .set("Authorization", `Bearer ${teacherToken}`)
            .send({ grade: 30 });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Grade updated successfully");
    });

    it("rejects grading when grade is out of allowed boundaries", async () => {
        const response = await request(app)
            .patch(`/api/assignments/${assignmentId}/submissions/${submissionId}/grade`)
            .set("Authorization", `Bearer ${teacherToken}`)
            .send({ grade: 31 });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toMatch(/Grade must be less than or equal to the maximum score/i);
    });

    it("forbids grading when the requester is a student", async () => {
        const response = await request(app)
            .patch(`/api/assignments/${assignmentId}/submissions/${submissionId}/grade`)
            .set("Authorization", `Bearer ${studentToken}`)
            .send({ grade: 30 });

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty("message", "Access denied. You are not authorized to access this resource.");
    });
});

describe("Assignment creation", () => {
    it("creates a new assignment when the teacher is authorized", async () => {
        const response = await request(app)
            .post("/api/assignments")
            .set("Authorization", `Bearer ${teacherToken}`)
            .send({
                task: `Test assignment ${Date.now()}`,
                deadline: "2026-07-05T23:59:59Z",
                maxScore: 20
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("message", "Assignment created successfully");
    });

    it("fails assignment creation when validation fails", async () => {
        const response = await request(app)
            .post("/api/assignments")
            .set("Authorization", `Bearer ${teacherToken}`)
            .send({
                task: "",
                maxScore: "",
                minScore: "",
                deadline: ""
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
    });

    it("forbids assignment creation for a student role", async () => {
        const response = await request(app)
            .post("/api/assignments")
            .set("Authorization", `Bearer ${studentToken}`)
            .send({
                task: "Student cannot create this assignment",
                deadline: "2026-07-05T23:59:59Z",
                maxScore: 20,
                minScore: 10
            });

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty("message", "Access denied. You are not authorized to access this resource.");
    });
});

describe("Classroom creation", () => {
    it("rejects a second classroom creation when one already exists", async () => {
        const response = await request(app)
            .post("/api/classroom")
            .set("Authorization", `Bearer ${teacherToken}`)
            .send({ name: "Another classroom" });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Classroom already exists");
    });
});

describe("Classroom student patch", () => {
    it("updates classroom membership for student 2 or returns already-in-classroom", async () => {
        const response = await request(app)
            .patch("/api/classroom/students/2")
            .set("Authorization", `Bearer ${teacherToken}`);

        expect([200, 400]).toContain(response.status);
        if (response.status === 200) {
            expect(response.text).toMatch(/successfully/i);
        } else {
            expect(response.body).toHaveProperty("message");
        }
    });

    it("updates classroom membership for student 3 or returns already-in-classroom", async () => {
        const response = await request(app)
            .patch("/api/classroom/students/3")
            .set("Authorization", `Bearer ${teacherToken}`);

        expect([200, 400]).toContain(response.status);
        if (response.status === 200) {
            expect(response.text).toMatch(/successfully/i);
        } else {
            expect(response.body).toHaveProperty("message");
        }
    });
});
