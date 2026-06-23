import Router from "express";
import {getTeacherById, getTeachers} from "../services/teacher.service";
import {registerTeacher} from "../services/auth.service";

const teacherRouter = Router();

teacherRouter.get("/", getTeachers);
teacherRouter.get("/:teacherId", getTeacherById);
teacherRouter.post("/register", registerTeacher);

export default teacherRouter;