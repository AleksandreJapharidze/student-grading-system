import Router from "express";
import {getTeacherById, getTeachers} from "../services/teacher.service";
import {registerTeacher} from "../services/auth.service";
import {asyncHandler} from "../middleware/async-handler";
import {validateSchema} from "../middleware/validation.middleware";

const teacherRouter = Router();

teacherRouter.get("/", asyncHandler(getTeachers));
teacherRouter.get(
    "/:teacherId",
    validateSchema({teacherId: {in: "params", required: true, type: "number"}}),
    asyncHandler(getTeacherById)
);
teacherRouter.post(
    "/register",
    validateSchema({
        name: {required: true, type: "string"},
        email: {required: true, type: "string"},
        password: {required: true, type: "string"},
    }),
    asyncHandler(registerTeacher)
);

export default teacherRouter;