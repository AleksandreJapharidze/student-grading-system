import Router from "express";
import {createAssignment, deleteAssignment, getAssignmentById, getAssignmentsByClassroomId} from "../services/assignment.service";
import {getSubmissionsByAssignmentId, submitAssignment, deleteSubmission, gradeSubmission} from "../services/assignment-submission.service";
import {asyncHandler} from "../middleware/async-handler";
import {validateSchema} from "../middleware/validation.middleware";

const assignmentRouter = Router();

assignmentRouter.post(
    "/",
    validateSchema({
        task: {required: true, type: "string"},
        deadline: {required: true, type: "string"},
        classroomId: {required: true, type: "number"},
    }),
    asyncHandler(createAssignment)
);
assignmentRouter.get("/:assignmentId", validateSchema({assignmentId: {in: "params", required: true, type: "number"}}), asyncHandler(getAssignmentById));
assignmentRouter.delete("/:assignmentId", validateSchema({assignmentId: {in: "params", required: true, type: "number"}}), asyncHandler(deleteAssignment));

assignmentRouter.delete(
    "/:assignmentId/submissions/:submissionId",
    validateSchema({
        assignmentId: {in: "params", required: true, type: "number"},
        submissionId: {in: "params", required: true, type: "number"},
    }),
    asyncHandler(deleteSubmission)
);
assignmentRouter.get(
    "/:assignmentId/submissions",
    validateSchema({assignmentId: {in: "params", required: true, type: "number"}}),
    asyncHandler(getSubmissionsByAssignmentId)
);
assignmentRouter.patch(
    "/:assignmentId/submissions/:submissionId/grade",
    validateSchema({
        assignmentId: {in: "params", required: true, type: "number"},
        submissionId: {in: "params", required: true, type: "number"},
        grade: {in: "body", required: true, type: "number", min: 0, max: 10},
    }),
    asyncHandler(gradeSubmission)
);

export default assignmentRouter;