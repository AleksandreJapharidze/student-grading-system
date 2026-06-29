import cors from "cors";
import express from "express";
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

import { notFoundHandler, errorHandler } from "./middleware/error.middleware";
import { submitAssignment } from "./services/assignment-submission.service";

console.log("Environment:", process.env.NODE_ENV);

const app = express();

const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

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

app.post("/api/assignments/:assignmentId/submissions", upload.array("files"), submitAssignment);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
