import express, { Request, Response, NextFunction } from "express";

import {createClass, getClass, getClassByStudentId, getClasses} from "./services/classroom.service";
import {AppDataSource} from "./config/type-orm-config";
import {createStudent, getStudentById, getStudents, getStudentsByClassroomId} from "./services/student.service";
import {addStudentToClassroom, removeStudentFromClassroom} from "./services/user.classroom.service";

const app = express();

app.use(express.json());

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).send("Something went wrong!");
});

app.get("/api/classroom", getClass);

app.get("/api/classroom/students", getStudentsByClassroomId)

app.post("/api/classroom", createClass);

app.get("/api/students", getStudents);

app.get("/api/students/:studentId", getStudentById);

app.post("/api/students", createStudent);

app.get("/api/students/:studentId/classroom", getClassByStudentId)

app.patch("/api/classroom/students/:studentId", addStudentToClassroom);

app.delete("/api/classroom/students/:studentId", removeStudentFromClassroom)

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