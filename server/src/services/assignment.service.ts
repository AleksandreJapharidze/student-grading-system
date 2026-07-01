import {NextFunction, Response, Request} from "express";

import {assignmentRepository} from "../database/repositories/assignment.repository";
import {classroomRepository} from "../database/repositories/classroom.repository";
import {userRepository} from "../database/repositories/user.repository";
import {AssignmentEntity} from "../database/models/assignment.entity";
import {ForbiddenError, NotFoundError, UnauthorizedError, ValidationError} from "../errors/app-error";
import {JwtPayload, verifyToken} from "../util/jwt.util";
import {ClassroomEntity} from "../database/models/classroom.entity";

export async function createAssignment(request: Request, response: Response, next: NextFunction) {
    try {
        const decodedJwt: JwtPayload | null = await verifyToken(request);
        if (!decodedJwt) {
            throw new UnauthorizedError();
        }

        if (decodedJwt.role !== "teacher") {
            throw new ForbiddenError("Access denied. You are not authorized to access this resource.");
        }

        const {task, deadline, maxScore} = request.body;

        let minScore: number | undefined = undefined;

        if (request.body.minScore) {
            minScore = request.body.minScore;
        }

        if (minScore && maxScore && minScore >= maxScore) {
            throw new ValidationError("minScore must be less than maxScore");
        }

        const classrooms: ClassroomEntity[] = await classroomRepository.find();
        if (classrooms.length === 0) {
            throw new NotFoundError("No classroom found");
        }

        const teacher = await userRepository.findOne({
            where: {id: decodedJwt.id, role: "teacher"},
            relations: {classroom: true},
        });

        if (!teacher) {
            throw new NotFoundError("Teacher not found");
        }

        if (!teacher.classroom) {
            throw new ForbiddenError("Access denied. You are not in this classroom.");
        }

        const classroom = classrooms[0];

        const assignment: AssignmentEntity = assignmentRepository.create({
            task,
            deadline: new Date(deadline),
            minScore,
            maxScore,
            classroom
        });

        console.log(assignment);

        await assignmentRepository.save(assignment);
        return response.status(201).json({message: "Assignment created successfully"});
    } catch (error) {
        next(error);
    }
}

export async function getAssignmentsByClassroomId(request: Request, response: Response, next: NextFunction) {
    try {
        const decodedJwt: JwtPayload | null = await verifyToken(request);
        if (!decodedJwt) {
            throw new UnauthorizedError("Unauthorized");
        }

        const classes: ClassroomEntity[] = await classroomRepository.find();
        if (classes.length === 0) {
            return response.status(404).json({message: "No classroom found"});
        }

        const classroom: ClassroomEntity | null | undefined = classes[0];
        if (!classroom) {
            return response.status(404).json({message: "Classroom not found"});
        }

        const user = await userRepository.findOne({
            where: {id: decodedJwt.id},
            relations: {classroom: true},
        });

        if (!user?.classroom) {
            throw new ForbiddenError("Access denied. You are not in this classroom.");
        }

        const classroomId: number = classroom.id;
        const assignments: AssignmentEntity[] = await assignmentRepository.find({
            where: {classroom: {id: classroomId}},
        });
        return response.status(200).json(assignments);
    } catch (error) {
        next(error);
    }
}

export async function getAssignmentById(request: Request, response: Response, next: NextFunction) {
    try {
        const assignmentId: number = parseInt(<string>request.params.assignmentId);
        const assignment: AssignmentEntity | null = await assignmentRepository.findOne({
            where: {id: assignmentId},
            relations: {classroom: true},
        });

        if (!assignment) {
            return response.status(404).json({message: "Assignment not found"});
        }

        return response.status(200).json(assignment);
    } catch (error) {
        next(error);
    }
}

export async function deleteAssignment(request: Request, response: Response, next: NextFunction) {
    try {
        const decodedJwt: JwtPayload | null = await verifyToken(request);
        if (!decodedJwt) {
            return response.status(401).json({message: "Unauthorized"});
        }

        if (decodedJwt.role !== "teacher") {
            return response.status(403).json({message: "Access denied. You are not authorized to access this resource."});
        }

        const assignmentId: number = parseInt(<string>request.params.assignmentId);
        const assignment: AssignmentEntity | null = await assignmentRepository.findOne({
            where: {id: assignmentId},
            relations: {classroom: true},
        });

        if (!assignment) {
            return response.status(404).json({message: "Assignment not found"});
        }

        const teacher = await userRepository.findOne({
            where: {id: decodedJwt.id, role: "teacher"},
            relations: {classroom: true},
        });

        if (!teacher?.classroom || teacher.classroom.id !== assignment.classroom.id) {
            throw new ForbiddenError("Access denied. You are not in this classroom.");
        }

        await assignmentRepository.remove(assignment);
        return response.status(204).end();
    } catch (error) {
        next(error);
    }
}
