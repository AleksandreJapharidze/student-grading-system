import {NextFunction, Response, Request} from "express";

import {assignmentRepository} from "../database/repositories/assignment.repository";
import {classroomRepository} from "../database/repositories/classroom.repository";
import {userRepository} from "../database/repositories/user.repository";
import {AssignmentEntity} from "../database/models/assignment.entity";
import {JwtPayload, verifyToken} from "../util/jwt.util";
import {ClassroomEntity} from "../database/models/classroom.entity";

export async function createAssignment(request: Request, response: Response, next: NextFunction) {
    try {
        const decodedJwt: JwtPayload | null = await verifyToken(request);
        if (!decodedJwt) {
            return response.status(401).json({message: "Unauthorized"});
        }

        if (decodedJwt.role !== "teacher") {
            return response.status(403).json({message: "Access denied. You are not authorized to access this resource."});
        }

        const {task, deadline, classroomId} = request.body;

        if (!task || !deadline || !classroomId) {
            return response.status(400).json({message: "task, deadline, and classroomId are required"});
        }

        const classroom = await classroomRepository.findOne({where: {id: classroomId}});
        if (!classroom) {
            return response.status(404).json({message: "Classroom not found"});
        }

        const teacher = await userRepository.findOne({
            where: {id: decodedJwt.id, role: "teacher"},
            relations: {classroom: true},
        });

        if (!teacher) {
            return response.status(404).json({message: "Teacher not found"});
        }

        if (!teacher.classroom || teacher.classroom.id !== classroomId) {
            return response.status(403).json({message: "Access denied. You are not in this classroom."});
        }

        const assignment: AssignmentEntity = assignmentRepository.create({
            task,
            deadline: new Date(deadline),
            classroom,
        });

        const savedAssignment = await assignmentRepository.save(assignment);
        return response.status(201).json({message: "Assignment created successfully"});
    } catch (error) {
        next(error);
    }
}

export async function getAssignmentsByClassroomId(request: Request, response: Response, next: NextFunction) {
    try {
        const classes: ClassroomEntity[] = await classroomRepository.find();
        if (classes.length === 0) {
            return response.status(404).json({message: "No classroom found"});
        }

        const classroom: ClassroomEntity | null | undefined = classes[0];
        if (!classroom) {
            return response.status(404).json({message: "Classroom not found"});
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
            return response.status(403).json({message: "Access denied. You are not in this classroom."});
        }

        await assignmentRepository.remove(assignment);
        return response.status(204).end();
    } catch (error) {
        next(error);
    }
}
