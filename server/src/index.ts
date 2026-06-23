import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import path from "path";
import multer from "multer";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import classroomRouter from "./routers/classroom.router";
import studentRouter from "./routers/student.router";
import teacherRouter from "./routers/teacher.router";
import assignmentRoute from "./routers/assignment.router";
import authRouter from "./routers/auth.router";
import fileRouter from "./routers/file.router";
import userRouter from "./routers/user.router";

import { AppDataSource } from "./config/type-orm-config";
import { submitAssignment } from "./services/assignment-submission.service";

const app = express();

const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).send("Something went wrong!");
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

app.use("/api/classroom", classroomRouter);
app.use("/api/students", studentRouter);
app.use("/api/teachers", teacherRouter);
app.use("/api/assignments", assignmentRoute);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/files", fileRouter);

// app.post("/api/auth/login", login);
// app.get("/api/students", getStudents);
// app.get("/api/students/:studentId", getStudentById);
// app.post("/api/students", createStudent);
// app.post("/api/students/register", registerStudent);
// app.get("/api/teachers", getTeachers);
// app.get("/api/teachers/:teacherId", getTeacherById);
// app.post("/api/teachers/register", registerTeacher);
// app.get("/api/classroom", getClass);
// app.post("/api/classroom", createClass);
// app.delete("/api/classroom", deleteClass);
// app.get("/api/classroom/students", getStudentsByClassroomId);
// app.get("/api/classroom/teachers", getTeachersByClassroomId);
// app.patch("/api/classroom/students/:studentId", addStudentToClassroom);
// app.delete("/api/classroom/students/:studentId", removeStudentFromClassroom);
// app.patch("/api/classroom/teachers/:teacherId", addTeacherToClassroom);
// app.delete("/api/classroom/teachers/:teacherId", removeTeacherFromClassroom);
// app.get("/api/users/:userId/classroom", getClassByUserId);

// app.post("/api/assignments", createAssignment);

// app.get("/api/classroom/assignments", getAssignmentsByClassroomId);
// app.get("/api/assignments/:assignmentId", getAssignmentById);
// app.delete("/api/assignments/:assignmentId", deleteAssignment);

app.post("/api/assignments/:assignmentId/submissions", upload.array("files"), submitAssignment);
// app.delete("/api/assignments/:assignmentId/submissions/:submissionId", deleteSubmission);
// app.get("/api/files/:fileName", getSubmissionFileByFileName);

// app.get("/api/assignments/:assignmentId/submissions", getSubmissionsByAssignmentId);
// app.get("/api/students/:studentId/submissions", getSubmissionsByStudentId);
// app.patch("/api/assignments/:assignmentId/submissions/:submissionId/grade", gradeSubmission);

AppDataSource.initialize()
    .then(() => {
        console.log("Database connected");
        const port = Number(process.env.PORT) || 3000;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error("Database connection failed", err);
    });
