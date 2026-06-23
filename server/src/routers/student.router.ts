import Router from "express";
import {getStudentById, getStudents} from "../services/student.service";
import {registerStudent} from "../services/auth.service";
import {getSubmissionsByStudentId} from "../services/assignment-submission.service";

const studentRouter = Router();

studentRouter.get("/", getStudents);
studentRouter.get("/:studentId", getStudentById);
studentRouter.post("/register", registerStudent);

studentRouter.get("/:studentId/submissions", getSubmissionsByStudentId);

export default studentRouter;