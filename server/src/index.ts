import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

import {createClass, deleteClass, getClass, getClassByStudentId} from "./services/classroom.service";
import {AppDataSource} from "./config/type-orm-config";
import {createStudent, getStudentById, getStudents, getStudentsByClassroomId} from "./services/student.service";
import {addStudentToClassroom, addTeacherToClassroom, removeStudentFromClassroom, removeTeacherFromClassroom} from "./services/user.classroom.service";
import {getTeachers, getTeachersByClassroomId} from "./services/teacher.service";
import {login, registerStudent, registerTeacher} from "./services/auth.service";

dotenv.config({path: "../.env"});

const app = express();

app.use(express.json());

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).send("Something went wrong!");
});

app.post("/api/auth/login", login)

app.get("/api/students", getStudents);

app.get("/api/students/:studentId", getStudentById);

app.post("/api/students", createStudent);

app.get("/api/students/:studentId/classroom", getClassByStudentId);

app.post("/api/students/register", registerStudent);

app.get("/api/teachers", getTeachers);

app.get("/api/teachers/:teacherId", getStudentById);

app.post("/api/teachers", createStudent);

app.get("/api/teachers/:teacherId/classroom", getClassByStudentId);

app.post("api/teachers/register", registerTeacher);

app.get("/api/classroom", getClass);

app.post("/api/classroom", createClass);

app.delete("/api/classroom/", deleteClass)

app.get("/api/classroom/students", getStudentsByClassroomId);

app.get("/api/classroom/teachers", getTeachersByClassroomId);

app.patch("/api/classroom/students/:studentId", addStudentToClassroom);

app.delete("/api/classroom/students/:studentId", removeStudentFromClassroom);

app.patch("/api/classroom/teachers/:teacherId", addTeacherToClassroom);

app.delete("/api/classroom/teachers/:teacherId", removeTeacherFromClassroom);

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