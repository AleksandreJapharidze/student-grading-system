import Router from "express";
import {body, param} from "express-validator";
import {getTeacherById, getTeachers} from "../services/teacher.service";
import {registerTeacher} from "../services/auth.service";
import {asyncHandler} from "../middleware/async-handler";
import {validateRequest} from "../middleware/validation.middleware";

const teacherRouter = Router();

teacherRouter.get("/", asyncHandler(getTeachers));
teacherRouter.get(
    "/:teacherId",
    param("teacherId").isInt().withMessage("teacherId must be an integer").toInt(),
    validateRequest,
    asyncHandler(getTeacherById)
);
teacherRouter.post(
    "/register",
    body("name").trim().notEmpty().withMessage("name is required"),
    body("email").trim().notEmpty().withMessage("email is required").isEmail().withMessage("email must be valid"),
    body("password").notEmpty().withMessage("password is required"),
    validateRequest,
    asyncHandler(registerTeacher)
);

export default teacherRouter;