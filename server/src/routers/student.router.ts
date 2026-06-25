import Router from "express";
import {body, param} from "express-validator";
import {getStudentById, getStudents} from "../services/student.service";
import {registerStudent} from "../services/auth.service";
import {getSubmissionsByStudentId} from "../services/assignment-submission.service";
import {getTotalFinalGradeForStudent} from "../services/grading.service";

import {asyncHandler} from "../middleware/async-handler";
import {validateRequest} from "../middleware/validation.middleware";

const studentRouter = Router();

studentRouter.get("/", asyncHandler(getStudents));
studentRouter.get(
    "/:studentId",
    param("studentId").isInt().withMessage("studentId must be an integer").toInt(),
    validateRequest,
    asyncHandler(getStudentById)
);
studentRouter.post(
    "/register",
    body("name").trim().notEmpty().withMessage("name is required"),
    body("email").trim().notEmpty().withMessage("email is required").isEmail().withMessage("email must be valid"),
    body("password").notEmpty().withMessage("password is required"),
    validateRequest,
    asyncHandler(registerStudent)
);

studentRouter.get(
    "/:studentId/submissions",
    param("studentId").isInt().withMessage("studentId must be an integer").toInt(),
    validateRequest,
    asyncHandler(getSubmissionsByStudentId)
);

studentRouter.get(
    "/:studentId/final-grade",
    param("studentId").isInt().withMessage("studentId must be an integer").toInt(),
    validateRequest,
    asyncHandler(getTotalFinalGradeForStudent)
);

export default studentRouter;