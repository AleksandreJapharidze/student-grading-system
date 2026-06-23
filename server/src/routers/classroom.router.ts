import Router from "express";
import {createClass, deleteClass, getClass, getClassByUserId} from "../services/classroom.service";
import {getTeachersByClassroomId} from "../services/teacher.service";
import {getStudentsByClassroomId} from "../services/student.service";
import {addStudentToClassroom, addTeacherToClassroom, removeStudentFromClassroom, removeTeacherFromClassroom} from "../services/user.classroom.service";
import {getAssignmentsByClassroomId} from "../services/assignment.service";

const classroomRouter = Router();

classroomRouter.get("/", getClass);
classroomRouter.post("/", createClass);
classroomRouter.delete("/", deleteClass);

classroomRouter.get("/students", getStudentsByClassroomId);
classroomRouter.get("/teachers", getTeachersByClassroomId);

classroomRouter.patch("/students/:studentId", addStudentToClassroom);
classroomRouter.delete("/students/:studentId", removeStudentFromClassroom);
classroomRouter.patch("/teachers/:teacherId", addTeacherToClassroom);
classroomRouter.delete("/teachers/:teacherId", removeTeacherFromClassroom);

classroomRouter.get("/:classroomId/assignments", getAssignmentsByClassroomId);

export default classroomRouter;