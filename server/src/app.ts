import express from "express";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import classroomRouter from "./routers/classroom.router";
import studentRouter from "./routers/student.router";
import teacherRouter from "./routers/teacher.router";
import assignmentRoute from "./routers/assignment.router";
import authRouter from "./routers/auth.router";
import fileRouter from "./routers/file.router";
import userRouter from "./routers/user.router";

import { notFoundHandler, errorHandler } from "./middleware/error.middleware";

console.log("Environment:", process.env.NODE_ENV);

const app = express();

app.use(express.json());

app.use("/api/classroom", classroomRouter);
app.use("/api/students", studentRouter);
app.use("/api/teachers", teacherRouter);
app.use("/api/assignments", assignmentRoute);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/files", fileRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
