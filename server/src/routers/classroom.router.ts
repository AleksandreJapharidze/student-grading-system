import Router from "express";
import {createClass, deleteClass, getClass, getClassByUserId} from "../services/classroom.service";
import {getTeachersByClassroomId} from "../services/teacher.service";
import {getStudentsByClassroomId} from "../services/student.service";
import {addStudentToClassroom, addTeacherToClassroom, removeStudentFromClassroom, removeTeacherFromClassroom} from "../services/user.classroom.service";
import {getAssignmentsByClassroomId} from "../services/assignment.service";
import {asyncHandler} from "../middleware/async-handler";
import {validateSchema} from "../middleware/validation.middleware";

const classroomRouter = Router();

classroomRouter.get("/", asyncHandler(getClass));
classroomRouter.post(
    "/",
    validateSchema({name: {required: true, type: "string"}}),
    asyncHandler(createClass)
);
classroomRouter.delete("/", asyncHandler(deleteClass));

classroomRouter.get("/students", asyncHandler(getStudentsByClassroomId));
classroomRouter.get("/teachers", asyncHandler(getTeachersByClassroomId));

classroomRouter.patch(
    "/students/:studentId",
    validateSchema({studentId: {in: "params", required: true, type: "number"}}),
    asyncHandler(addStudentToClassroom)
);
classroomRouter.delete(
    "/students/:studentId",
    validateSchema({studentId: {in: "params", required: true, type: "number"}}),
    asyncHandler(removeStudentFromClassroom)
);
classroomRouter.patch(
    "/teachers/:teacherId",
    validateSchema({teacherId: {in: "params", required: true, type: "number"}}),
    asyncHandler(addTeacherToClassroom)
);
classroomRouter.delete(
    "/teachers/:teacherId",
    validateSchema({teacherId: {in: "params", required: true, type: "number"}}),
    asyncHandler(removeTeacherFromClassroom)
);

classroomRouter.get(
    "/:classroomId/assignments",
    validateSchema({classroomId: {in: "params", required: true, type: "number"}}),
    asyncHandler(getAssignmentsByClassroomId)
);

export default classroomRouter;