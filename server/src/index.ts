import dotenv from "dotenv";
import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import multer from "multer";
import fs from "fs";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import classroomRouter from "./routers/classroom.router";
import studentRouter from "./routers/student.router";
import teacherRouter from "./routers/teacher.router";
import assignmentRoute from "./routers/assignment.router";
import authRouter from "./routers/auth.router";
import userRouter from "./routers/user.router";

import { notFoundHandler, errorHandler } from "./middleware/error.middleware";
import { AppDataSource } from "./config/type-orm-config";
import { submitAssignment } from "./services/assignment-submission.service";

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));
app.use(express.json());

const uploadsDir = path.resolve(__dirname, "..", "uploads");

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
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

app.post("/api/assignments/:assignmentId/submissions", upload.array("files"), submitAssignment);

app.use(notFoundHandler);
app.use(errorHandler);

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
