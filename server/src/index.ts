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
import { seedAdmin } from "./database/seed-admin";
import { submitAssignment } from "./services/assignment-submission.service";

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "student-grading-system-z1dz.vercel.app",
];

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
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

app.post(
    "/api/assignments/:assignmentId/submissions",
    (request, response, next) => {
        if (request.is("multipart/form-data")) {
            return upload.array("files")(request, response, next);
        }
        next();
    },
    submitAssignment
);

app.use(notFoundHandler);
app.use(errorHandler);

AppDataSource.initialize()
    .then(async () => {
        console.log("Database connected");
        if (process.env.NODE_ENV !== "test") {
            await seedAdmin();
        }
        const port = Number(process.env.PORT) || 4000;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error("Database connection failed", err);
    });
