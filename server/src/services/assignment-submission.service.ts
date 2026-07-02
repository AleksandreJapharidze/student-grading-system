import {NextFunction, Response, Request} from "express";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { supabase } from "../config/supabase.confg";

import {assignmentRepository} from "../database/repositories/assignment.repository";
import {assignmentSubmissionRepository} from "../database/repositories/assignment-submission.repository";
import {submissionFilePathRepository} from "../database/repositories/submission-file-path.repository";
import {userRepository} from "../database/repositories/user.repository";
import {AssignmentSubmissionEntity} from "../database/models/assignment-submission.entity";
import {ForbiddenError, NotFoundError, UnauthorizedError, ValidationError, UnprocessableEntityError} from "../errors/app-error";
import {JwtPayload, verifyToken} from "../util/jwt.util";
import { SubmissionFilePathEntity } from "../database/models/submission-file-path.entity";

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

        if (assignment.deadline < new Date()) {
            throw new UnprocessableEntityError("Assignment deadline has passed");
        }

        if (submissionExists) {
            throw new ValidationError("You have already submitted this assignment");
        }

        const submission = assignmentSubmissionRepository.create({
            assignment,
            student
        });

        const savedSubmission = await assignmentSubmissionRepository.save(submission);

        const bucket = process.env.SUPABASE_BUCKET;
        if (!bucket) {
            throw new Error("SUPABASE_BUCKET not found");
        }
        const publicUrls = [];

        for (const file of files) {
            const fileData = await fsPromises.readFile(file.path);

            const { error } = await supabase.storage.from(bucket).upload(file.filename, fileData);
            if (error) {
                throw new Error(error.message);
            }

            const { data } = await supabase.storage.from(bucket).getPublicUrl(file.filename);
            publicUrls.push(data.publicUrl);
        }

        const submissionFilePaths = publicUrls.map(publicUrl => submissionFilePathRepository.create({ path: publicUrl, submission: savedSubmission }));
        
        await submissionFilePathRepository.save(submissionFilePaths);

        savedSubmission.submissionFilePaths = submissionFilePaths;
        await assignmentSubmissionRepository.save(savedSubmission);
        clearSubmissionFiles(files);
        return response.status(201).json({ message: "Assignment submitted successfully" });
    } catch (error) {
        const files = request.files as Express.Multer.File[];
        if (files && files.length > 0) {
            clearSubmissionFiles(files);
        }
        next(error)
    }
}

export async function getSubmissionsByAssignmentId(request: Request, response: Response, next: NextFunction) {
    try {
        const decodedJwt: JwtPayload | null = await verifyToken(request);
        if (!decodedJwt) {
            throw new UnauthorizedError("Unauthorized");
        }

        if (decodedJwt.role !== "teacher") {
            throw new ForbiddenError("Access denied. You are not authorized to access this resource.");
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

export async function getSubmissionByAssignmentIdAndStudentId(request: Request, response: Response, next: NextFunction) {
    try {
        const decodedJwt: JwtPayload | null = await verifyToken(request);
        if (!decodedJwt) {
            throw new UnauthorizedError("Unauthorized");
        }

        const assignmentId: number = parseInt(<string>request.params.assignmentId);
        const studentId: number = parseInt(<string>request.query.studentId);

        console.log(decodedJwt.id === studentId);
        console.log(decodedJwt.role === "student");

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

        return response.status(200).json({ id: submission.id, turnInDate: submission.turnInDate, grade: submission.grade, submissionFilePaths: submission.submissionFilePaths });
    } catch (error) {
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
            relations: {assignment: true, student: true, submissionFilePaths: true},
        });
        
        if (!submission) {
            throw new NotFoundError("Submission not found");
        }

        if (!submission.student || submission.student.id !== decodedJwt.id) {
            throw new ForbiddenError("Access denied. You are not authorized to access this resource.");
        }

        if (submission.assignment.deadline < new Date()) {
            throw new UnprocessableEntityError("Assignment deadline has passed. You cannot delete this submission.");
        }

        if (submission.submissionFilePaths !== null && submission.submissionFilePaths !== undefined) {
            const filePaths = submission.submissionFilePaths;
            for (const filePath of filePaths) {
                const lastSlashIndex = filePath.path.lastIndexOf("/");
                const fileName = filePath.path.substring(lastSlashIndex + 1);
                const { error } = await supabase.storage.from("students-submissions").remove([fileName]);
                if (error) {
                    throw new Error(error.message);
                }
                await submissionFilePathRepository.delete(filePath.id);
            }
        }
        assignmentSubmissionRepository.delete(submission.id);
        return response.status(200).json({message: "Submission deleted successfully"});
    } catch (error) {
        next(error);
    }
}

async function clearSubmissionFiles(files: Express.Multer.File[]) {
    const uploadsDir = path.resolve(__dirname, "..", "..", "uploads");
    for (const file of files) {
        const filePath = path.join(uploadsDir, file.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
}