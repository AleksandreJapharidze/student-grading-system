import Router from "express";
import {body, param, query} from "express-validator";
import {createAssignment, deleteAssignment, getAssignmentById} from "../services/assignment.service";
import {getSubmissionsByAssignmentId, getSubmissionByAssignmentIdAndStudentId, deleteSubmission} from "../services/assignment-submission.service";
import {gradeSubmission} from "../services/grading.service";
import {asyncHandler} from "../middleware/async-handler";
import {validateRequest} from "../middleware/validation.middleware";

const assignmentRouter = Router();

assignmentRouter.post(
    "/",
    body("task").trim().notEmpty().withMessage("task is required"),
    body("deadline").trim().notEmpty().withMessage("deadline is required"),
    body("maxScore").isInt().withMessage("maxScore must be an integer").toInt(),
    validateRequest,
    asyncHandler(createAssignment)
);
assignmentRouter.get(
    "/:assignmentId",
    param("assignmentId").isInt().withMessage("assignmentId must be an integer").toInt(),
    validateRequest,
    asyncHandler(getAssignmentById)
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
assignmentRouter.get(
    "/:assignmentId/submissions",
    param("assignmentId").isInt().withMessage("assignmentId must be an integer").toInt(),
    query("studentId").isInt().withMessage("studentId must be an integer").toInt(),
    validateRequest,
    asyncHandler(getSubmissionByAssignmentIdAndStudentId)
);
assignmentRouter.patch(
    "/:assignmentId/submissions/:submissionId/grade",
    param("assignmentId").isInt().withMessage("assignmentId must be an integer").toInt(),
    param("submissionId").isInt({min: 0}).withMessage("submissionId must be an integer greater than 0").toInt(),
    body("grade").isInt().withMessage("grade must be an integer").toInt(),
    validateRequest,
    asyncHandler(gradeSubmission)
);

export default assignmentRouter;