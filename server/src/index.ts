import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

import {createClass, deleteClass, getClass, getClassByUserId} from "./services/classroom.service";
import {AppDataSource} from "./config/type-orm-config";
import {createStudent, getStudentById, getStudents, getStudentsByClassroomId} from "./services/student.service";
import {addStudentToClassroom, addTeacherToClassroom, removeStudentFromClassroom, removeTeacherFromClassroom} from "./services/user.classroom.service";
import {createTeacher, getTeacherById, getTeachers, getTeachersByClassroomId} from "./services/teacher.service";
import {login, registerStudent, registerTeacher} from "./services/auth.service";
import {createAssignment, deleteAssignment, getAssignmentById, getAssignmentsByClassroomId} from "./services/assignment.service";
import {getSubmissionsByAssignmentId, getSubmissionsByStudentId, gradeSubmission, submitAssignment} from "./services/assignment-submission.service";

dotenv.config({path: "../.env"});

const app = express();

const corsOptions = {
    origin: "http://localhost:5173",
    methods: ["GET,HEAD,PUT,PATCH,POST,DELETE"],
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).send("Something went wrong!");
});

app.post("/api/auth/login", login);
app.get("/api/students", getStudents);
app.get("/api/students/:studentId", getStudentById);
app.post("/api/students", createStudent);
app.post("/api/students/register", registerStudent);
app.get("/api/teachers", getTeachers);
app.get("/api/teachers/:teacherId", getTeacherById);
app.post("/api/teachers/register", registerTeacher);
app.get("/api/classroom", getClass);
app.post("/api/classroom", createClass);
app.delete("/api/classroom/", deleteClass);
app.get("/api/classroom/students", getStudentsByClassroomId);
app.get("/api/classroom/teachers", getTeachersByClassroomId);
app.patch("/api/classroom/students/:studentId", addStudentToClassroom);
app.delete("/api/classroom/students/:studentId", removeStudentFromClassroom);
app.patch("/api/classroom/teachers/:teacherId", addTeacherToClassroom);
app.delete("/api/classroom/teachers/:teacherId", removeTeacherFromClassroom);
app.get("/api/users/:userId/classroom", getClassByUserId);
app.post("/api/assignments", createAssignment);
app.get("/api/classroom/assignments", getAssignmentsByClassroomId);
app.get("/api/assignments/:assignmentId", getAssignmentById);
app.delete("/api/assignments/:assignmentId", deleteAssignment);
app.post("/api/assignments/:assignmentId/submissions", submitAssignment);
app.get("/api/assignments/:assignmentId/submissions", getSubmissionsByAssignmentId);
app.get("/api/students/:studentId/submissions", getSubmissionsByStudentId);
app.patch("/api/assignments/:assignmentId/submissions/:submissionId/grade", gradeSubmission);

AppDataSource.initialize()
    .then(() => {
        console.log("Database connected");
        app.listen(3000, () => {
            console.log("Server is running on port 3000");
        });
    })
    .catch((err) => {
        console.error("Database connection failed", err);
    });