import {NextFunction, Response, Request} from "express";
import fs from "fs";
import path from "path";

import {assignmentRepository} from "../database/repositories/assignment.repository";
import {assignmentSubmissionRepository} from "../database/repositories/assignment-submission.repository";
import {submissionFilePathRepository} from "../database/repositories/submission-file-path.repository";
import {userRepository} from "../database/repositories/user.repository";
import {AssignmentSubmissionEntity} from "../database/models/assignment-submission.entity";
import {ForbiddenError, NotFoundError, UnauthorizedError, ValidationError} from "../errors/app-error";
import {JwtPayload, verifyToken} from "../util/jwt.util";

export async function submitAssignment(request: Request, response: Response, next: NextFunction) {
    try {
        const decodedJwt: JwtPayload | null = await verifyToken(request);
        if (!decodedJwt) {
            throw new UnauthorizedError();
        }

        if (decodedJwt.role !== "student") {
            throw new ForbiddenError("Access denied. You are not authorized to access this resource.");
        }

        if (!request.params.assignmentId) {
            throw new ValidationError("assignmentId is required");
        }

        const assignmentId: number = parseInt(<string>request.params.assignmentId);

        const assignment = await assignmentRepository.findOne({ where: { id: assignmentId }, relations: { classroom: true } });
        if (!assignment) throw new NotFoundError("Assignment not found");

        const student = await userRepository.findOne({ where: { id: decodedJwt.id, role: "student" }, relations: { classroom: true } });
        if (!student) throw new NotFoundError("Student not found");

        if (!student.classroom || student.classroom.id !== assignment.classroom.id) {
            throw new ForbiddenError("Access denied. You are not in this classroom.");
        }

        if (!request.files || request.files.length === 0) throw new ValidationError("No files uploaded");

        const files = request.files as Express.Multer.File[];

        const submissionExists = await assignmentSubmissionRepository.findOne({
            where: {
                assignment: {id: assignmentId},
                student: {id: decodedJwt.id},
            },
        });

        if (submissionExists) {
            const uploadsDir = path.resolve(__dirname, "..", "uploads");
            for (const file of files) {
                const filePath = path.join(uploadsDir, file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            throw new ValidationError("You have already submitted this assignment");
        }

        const filePaths = files.map(file => file.filename);

        const submission = assignmentSubmissionRepository.create({
            assignment,
            student
        });

        const savedSubmission = await assignmentSubmissionRepository.save(submission);

        const submissionFilePaths = filePaths.map(filePath => submissionFilePathRepository.create({ path: filePath, submission: savedSubmission }));
        await submissionFilePathRepository.save(submissionFilePaths);

        savedSubmission.submissionFilePaths = submissionFilePaths;
        await assignmentSubmissionRepository.save(savedSubmission);
        return response.status(201).json({ message: "Assignment submitted successfully" });
    } catch (error) {
        next(error)
    }
}

export async function getSubmissionsByAssignmentId(request: Request, response: Response, next: NextFunction) {
    try {
        const decodedJwt: JwtPayload | null = await verifyToken(request);
        if (!decodedJwt) {
            return response.status(401).json({message: "Unauthorized"});
        }

        if (decodedJwt.role !== "teacher") {
            return response.status(403).json({message: "Access denied. You are not authorized to access this resource."});
        }

        const assignmentId: number = parseInt(<string>request.params.assignmentId);
        const assignment = await assignmentRepository.findOne({
            where: {id: assignmentId},
            relations: {classroom: true},
        });

        if (!assignment) {
            throw new NotFoundError("Assignment not found");
        }

        const teacher = await userRepository.findOne({
            where: {id: decodedJwt.id, role: "teacher"},
            relations: {classroom: true},
        });

        if (!teacher?.classroom || teacher.classroom.id !== assignment.classroom.id) {
            throw new ForbiddenError("Access denied. You are not in this classroom.");
        }

        const submissions: AssignmentSubmissionEntity[] = await assignmentSubmissionRepository.find({
            where: {assignment: {id: assignmentId}},
            relations: {student: true},
        });

        return response.status(200).json(submissions);
    } catch (error) {
        next(error);
    }
}

export async function getSubmissionsByStudentId(request: Request, response: Response, next: NextFunction) {
    try {
        const decodedJwt: JwtPayload | null = await verifyToken(request);
        if (!decodedJwt) {
            return response.status(401).json({message: "Unauthorized"});
        }

        const studentId: number = parseInt(<string>request.params.studentId);

        if (decodedJwt.id !== studentId || decodedJwt.role !== "student") {
            throw new ForbiddenError("Access denied. You are not authorized to access this resource.");
        }

        const submissions: AssignmentSubmissionEntity[] = await assignmentSubmissionRepository.find({
            where: {student: {id: studentId}},
            relations: {assignment: true},
        });

        return response.status(200).json(submissions);
    } catch (error) {
        next(error);
    }
}

export async function getSubmissionByAssignmentIdAndStudentId(request: Request, response: Response, next: NextFunction) {
    try {
        const decodedJwt: JwtPayload | null = await verifyToken(request);
        if (!decodedJwt) {
            return response.status(401).json({message: "Unauthorized"});
        }

        const assignmentId: number = parseInt(<string>request.params.assignmentId);
        const studentId: number = parseInt(<string>request.query.studentId);

        if (decodedJwt.id !== studentId || decodedJwt.role !== "student") {
            throw new ForbiddenError("Access denied. You are not authorized to access this resource.");
        }

        const submission = await assignmentSubmissionRepository.findOne({
            where: {assignment: {id: assignmentId}, student: {id: studentId}},
            relations: {assignment: true, student: true},
        });

        if (!submission) {
            throw new NotFoundError("Submission not found");
        }

        return response.status(200).json(submission);
    } catch (error) {
        next(error);
    }
}

export async function getSubmissionFileByFileName(request: Request, response: Response, next: NextFunction) {
    try {
        const decodedJwt: JwtPayload | null = await verifyToken(request);
        if (!decodedJwt) {
            throw new UnauthorizedError();
        }

        if (!request.params || !request.params.fileName) {
            throw new ValidationError("fileName is required");
        }

        const fileName: string = request.params.fileName as string;

        const filePath = path.join(path.resolve(__dirname, "..", "uploads"), fileName);

        if (!fs.existsSync(filePath)) {
            throw new NotFoundError("File not found");
        }
        
        return response.status(200).sendFile(filePath);
    } catch (error) {
        console.log("Unexpected error:", error);
        next(error);
    }
}

export async function deleteSubmission(request: Request, response: Response, next: NextFunction) {
    try {
        const decodedJwt: JwtPayload | null = await verifyToken(request);
        if (!decodedJwt) {
            throw new UnauthorizedError();
        }

        if (decodedJwt.role !== "student") {
            throw new ForbiddenError("Access denied. You are not authorized to access this resource.");
        }

        if (!request.params.submissionId) {
            throw new ValidationError("submissionId is required");
        }

        const submissionId: number = parseInt(<string>request.params.submissionId);

        const submission = await assignmentSubmissionRepository.findOne({
            where: {id: submissionId},
            relations: {assignment: true, student: true},
        });
        
        if (!submission) {
            return response.status(404).json({message: "Submission not found"});
        }

        if (!submission.student || submission.student.id !== decodedJwt.id) {
            throw new ForbiddenError("Access denied. You are not authorized to access this resource.");
        }

        await assignmentSubmissionRepository.delete(submission.id);

        if (submission.submissionFilePaths !== null && submission.submissionFilePaths !== undefined) {
            const uploadsDir = path.resolve(__dirname, "..", "uploads");
            for (const submissionFilePath of submission.submissionFilePaths) {
                const filePath = path.join(uploadsDir, submissionFilePath.path);

                if (!fs.existsSync(filePath)) {
                    throw new NotFoundError("File not found");
                }

                fs.unlinkSync(filePath);
            }
        }
        return response.status(200).json({message: "Submission deleted successfully"});
    } catch (error) {
        next(error);
    }
}

export async function gradeSubmission(request: Request, response: Response, next: NextFunction) {
    try {
        const decodedJwt: JwtPayload | null = await verifyToken(request);
        if (!decodedJwt) {
            return response.status(401).json({message: "Unauthorized"});
        }

        if (decodedJwt.role !== "teacher") {
            return response.status(403).json({message: "Access denied. You are not authorized to access this resource."});
        }

        const assignmentId: number = parseInt(<string>request.params.assignmentId);
        const submissionId: number = parseInt(<string>request.params.submissionId);
        const {grade} = request.body;

        if (grade === undefined || grade === null) {
            throw new ValidationError("grade is required");
        }

        if (typeof grade !== "number" || grade < 0 || grade > 10) {
            throw new ValidationError("grade must be a number between 0 and 10");
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
