import Router from "express";
import {createAssignment, deleteAssignment, getAssignmentById, getAssignmentsByClassroomId} from "../services/assignment.service";
import {getSubmissionsByAssignmentId, submitAssignment, deleteSubmission, gradeSubmission} from "../services/assignment-submission.service";

const assignmentRouter = Router();

assignmentRouter.post("/", createAssignment);
assignmentRouter.get("/:assignmentId", getAssignmentById);
assignmentRouter.delete("/:assignmentId", deleteAssignment);

assignmentRouter.delete("/:assignmentId/submissions/:submissionId", deleteSubmission);
assignmentRouter.get("/:assignmentId/submissions", getSubmissionsByAssignmentId);
assignmentRouter.patch("/:assignmentId/submissions/:submissionId/grade", gradeSubmission);

export default assignmentRouter;