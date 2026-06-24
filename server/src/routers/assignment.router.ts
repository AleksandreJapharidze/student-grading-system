import Router from "express";
import {body, param, query} from "express-validator";
import {createAssignment, deleteAssignment, getAssignmentById} from "../services/assignment.service";
import {getSubmissionsByAssignmentId, getSubmissionByAssignmentIdAndStudentId, deleteSubmission, gradeSubmission} from "../services/assignment-submission.service";
import {asyncHandler} from "../middleware/async-handler";
import {validateRequest} from "../middleware/validation.middleware";

const assignmentRouter = Router();

assignmentRouter.post(
    "/",
    body("task").trim().notEmpty().withMessage("task is required"),
    body("deadline").trim().notEmpty().withMessage("deadline is required"),
    body("classroomId").isInt().withMessage("classroomId must be an integer").toInt(),
    validateRequest,
    asyncHandler(createAssignment)
);
assignmentRouter.get(
    "/:assignmentId",
    param("assignmentId").isInt().withMessage("assignmentId must be an integer").toInt(),
    validateRequest,
    asyncHandler(getAssignmentById)
);
assignmentRouter.get(
    "/:assignmentId/submissions",
    param("assignmentId").isInt().withMessage("assignmentId must be an integer").toInt(),
    query("studentId").isInt().withMessage("studentId must be an integer").toInt(),
    validateRequest,
    asyncHandler(getSubmissionByAssignmentIdAndStudentId)
);
assignmentRouter.delete(
    "/:assignmentId",
    param("assignmentId").isInt().withMessage("assignmentId must be an integer").toInt(),
    validateRequest,
    asyncHandler(deleteAssignment)
);
assignmentRouter.delete(
    "/:assignmentId/submissions/:submissionId",
    param("assignmentId").isInt().withMessage("assignmentId must be an integer").toInt(),
    param("submissionId").isInt().withMessage("submissionId must be an integer").toInt(),
    validateRequest,
    asyncHandler(deleteSubmission)
);
assignmentRouter.get(
    "/:assignmentId/submissions",
    param("assignmentId").isInt().withMessage("assignmentId must be an integer").toInt(),
    validateRequest,
    asyncHandler(getSubmissionsByAssignmentId)
);
assignmentRouter.patch(
    "/:assignmentId/submissions/:submissionId/grade",
    param("assignmentId").isInt().withMessage("assignmentId must be an integer").toInt(),
    param("submissionId").isInt().withMessage("submissionId must be an integer").toInt(),
    body("grade").isInt({min: 0, max: 10}).withMessage("grade must be an integer between 0 and 10").toInt(),
    validateRequest,
    asyncHandler(gradeSubmission)
);

export default assignmentRouter;