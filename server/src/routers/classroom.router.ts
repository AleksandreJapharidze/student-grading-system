import Router from "express";
import {body, param} from "express-validator";
import {createClass, deleteClass, getClass, getClassByUserId} from "../services/classroom.service";
import {getTeachersByClassroomId} from "../services/teacher.service";
import {getStudentsByClassroomId} from "../services/student.service";
import {addStudentToClassroom, addTeacherToClassroom, removeStudentFromClassroom, removeTeacherFromClassroom} from "../services/user.classroom.service";
import {getAssignmentsByClassroomId} from "../services/assignment.service";
import {asyncHandler} from "../middleware/async-handler";
import {validateRequest} from "../middleware/validation.middleware";

const classroomRouter = Router();

classroomRouter.get("/", asyncHandler(getClass));
classroomRouter.post(
    "/",
    body("name").trim().notEmpty().withMessage("name is required"),
    validateRequest,
    asyncHandler(createClass)
);
classroomRouter.delete("/", asyncHandler(deleteClass));

classroomRouter.get("/students", asyncHandler(getStudentsByClassroomId));
classroomRouter.get("/teachers", asyncHandler(getTeachersByClassroomId));

classroomRouter.patch(
    "/students/:studentId",
    param("studentId").isInt().withMessage("studentId must be an integer").toInt(),
    validateRequest,
    asyncHandler(addStudentToClassroom)
);
classroomRouter.delete(
    "/students/:studentId",
    param("studentId").isInt().withMessage("studentId must be an integer").toInt(),
    validateRequest,
    asyncHandler(removeStudentFromClassroom)
);
classroomRouter.patch(
    "/teachers/:teacherId",
    param("teacherId").isInt().withMessage("teacherId must be an integer").toInt(),
    validateRequest,
    asyncHandler(addTeacherToClassroom)
);
classroomRouter.delete(
    "/teachers/:teacherId",
    param("teacherId").isInt().withMessage("teacherId must be an integer").toInt(),
    validateRequest,
    asyncHandler(removeTeacherFromClassroom)
);

classroomRouter.get(
    "/assignments",
    validateRequest,
    asyncHandler(getAssignmentsByClassroomId)
);

export default classroomRouter;