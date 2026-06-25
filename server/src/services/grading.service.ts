import {NextFunction, Response, Request} from "express";
import PdfDocument from "pdfkit";

import {assignmentRepository} from "../database/repositories/assignment.repository";
import {assignmentSubmissionRepository} from "../database/repositories/assignment-submission.repository";
import {userRepository} from "../database/repositories/user.repository";
import {ForbiddenError, NotFoundError, UnauthorizedError, ValidationError} from "../errors/app-error";
import {JwtPayload, verifyToken} from "../util/jwt.util";

export async function gradeSubmission(request: Request, response: Response, next: NextFunction) {
    try {
        const decodedJwt: JwtPayload | null = await verifyToken(request);
        if (!decodedJwt) {
            throw new UnauthorizedError("Unauthorized");
        }

        if (decodedJwt.role !== "teacher") {
            throw new ForbiddenError("Access denied. You are not authorized to access this resource.");
        }

        const assignmentId: number = parseInt(<string>request.params.assignmentId);
        const submissionId: number = parseInt(<string>request.params.submissionId);
        const {grade} = request.body;

        const assignment = await assignmentRepository.findOne({
            where: {id: assignmentId},
            relations: {classroom: true},
        });

        if (!assignment) {
            throw new NotFoundError("Assignment not found");
        }

        if (assignment.minScore && grade < assignment.minScore) {
            throw new ValidationError("Grade must be greater than or equal to the minimum score");
        }

        if (grade > assignment.maxScore) {
            throw new ValidationError("Grade must be less than or equal to the maximum score");
        }

        const submission = await assignmentSubmissionRepository.findOne({
            where: {id: submissionId, assignment: {id: assignmentId}},
            relations: {assignment: {classroom: true}},
        });

        if (!submission) {
            throw new NotFoundError("Submission not found");
        }

        if (!submission.turnInDate) {
            throw new ValidationError("Submission has not been turned in");
        }

        const teacher = await userRepository.findOne({
            where: {id: decodedJwt.id, role: "teacher"},
            relations: {classroom: true},
        });

        if (!teacher?.classroom || teacher.classroom.id !== submission.assignment.classroom.id) {
            throw new ForbiddenError("Access denied. You are not in this classroom.");
        }

        submission.grade = grade;
        await assignmentSubmissionRepository.save(submission);
        return response.status(200).json({message: "Grade updated successfully"});
    } catch (error) {
        next(error);
    }
}

export async function getTotalFinalGradeForStudent(request: Request, response: Response, next: NextFunction) {
    try {
        // const decodedJwt: JwtPayload | null = await verifyToken(request);
        // if (!decodedJwt) {
        //     throw new UnauthorizedError("Unauthorized");
        // }

        const studentId: number = parseInt(<string>request.params.studentId);

        // if (decodedJwt.role === "student" && decodedJwt.id !== studentId) {
        //     throw new ForbiddenError("Access denied. You are not authorized to access this resource.");
        // }

        const assignments = await assignmentRepository.find();

        let totalGrade: number = 0;
        let studentTotalGrade: number = 0;

        for (const assignment of assignments) {
            totalGrade += assignment.maxScore;

            const submission = await assignmentSubmissionRepository.findOne({
                where: {student: {id: studentId}, assignment: {id: assignment.id}}
            });

            if (submission && submission.grade) {
                studentTotalGrade += submission.grade;
            }
        }

        response.setHeader("Content-Type", "application/pdf");

        const passed: boolean = studentTotalGrade !== 0 && totalGrade / studentTotalGrade >= 0.5;

        const pdfDocument = new PdfDocument();
        pdfDocument.fontSize(20);
        pdfDocument.text(`Student id: ${studentId}`, 10, 10);
        pdfDocument.text(`Total grade: ${totalGrade}`, 10, 40);
        pdfDocument.text(`Student total grade: ${studentTotalGrade}`, 10, 70);
        if (passed) {
            pdfDocument.text("This student passed this course successfully", 10, 110);
        } else {
            pdfDocument.text("This student failed this course", 10, 110);
        }

        pdfDocument.pipe(response);
        pdfDocument.end();
    } catch (error) {
        next(error);
    }
}