import express, { Request, Response, NextFunction } from "express";

import {createClass, getClassById, getClasses} from "./services/classroom.service";
import { AppDataSource } from "./config/type-orm-config";
import {createStudent, getStudentById, getStudents} from "./services/student.service";

const app = express();

app.use(express.json());

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).send("Something went wrong!");
});

app.get("/api/teacher/classrooms/:id", getClassById);

app.post("/api/teacher/classrooms", createClass);

app.get("/api/teacher/classrooms", getClasses);

app.get("/api/students", getStudents);

app.get("/api/students/:id", getStudentById)

app.post("/api/students", createStudent)

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