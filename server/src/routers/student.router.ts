import Router from "express";
import {getStudentById, getStudents} from "../services/student.service";
import {registerStudent} from "../services/auth.service";
import {getSubmissionsByStudentId} from "../services/assignment-submission.service";
import {asyncHandler} from "../middleware/async-handler";
import {validateSchema} from "../middleware/validation.middleware";

const studentRouter = Router();

studentRouter.get("/", asyncHandler(getStudents));
studentRouter.get(
    "/:studentId",
    validateSchema({studentId: {in: "params", required: true, type: "number"}}),
    asyncHandler(getStudentById)
);
studentRouter.post(
    "/register",
    validateSchema({
        name: {required: true, type: "string"},
        email: {required: true, type: "string"},
        password: {required: true, type: "string"},
    }),
    asyncHandler(registerStudent)
);

studentRouter.get(
    "/:studentId/submissions",
    validateSchema({studentId: {in: "params", required: true, type: "number"}}),
    asyncHandler(getSubmissionsByStudentId)
);

export default studentRouter;