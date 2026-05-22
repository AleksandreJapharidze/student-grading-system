import {NextFunction, Response, Request} from "express";

import {userRepository} from "../database/repositories/user.repository"
import {UserEntity} from "../database/models/user.entity";

import {classroomRepository} from "../database/repositories/classroom.repository"
import {ClassroomEntity} from "../database/models/classroom.entity";
import {verifyToken} from "../util/jwt.util";

export async function addStudentToClassroom(request: Request, response: Response, next: NextFunction) {
    try {
        const decodedJwt = await verifyToken(request);
        if (!decodedJwt) {
            return response.status(401).json({message: "Unauthorized"});
        }

        const studentId: number = parseInt(<string>request.params.studentId)
        if (decodedJwt.role !== "teacher" && decodedJwt.role !== "admin") {
            return response.status(403).json({message: "Access denied. You are not authorized to access this resource."});
        }

        const student: UserEntity | null = await userRepository.findOne({where: {id: studentId, role: "student"}});

        if (!student) {
            return response.status(404).json({message: "Student not found"});
        }

        if (student.classroom) {
            return response.status(400).json({message: "Student is already in a classroom"});
        }

        const classroom: ClassroomEntity | null = await classroomRepository.findOne({where: {id: 1}});

        if (!classroom) {
            return response.status(404).json({message: "Classroom not found"});
        }

        student.classroom = classroom;
        await userRepository.save(student);
        return response.status(200).send("Student added to classroom successfully.");
    } catch (error) {
        next(error);
    }
}

export async function addTeacherToClassroom(request: Request, response: Response, next: NextFunction) {
    try {
        const decodedJwt = await verifyToken(request);
        if (!decodedJwt) {
            return response.status(401).json({message: "Unauthorized"});
        }

        const teacherId: number = parseInt(<string>request.params.teacherId)
        if (decodedJwt.role !== "teacher" && decodedJwt.role !== "admin") {
            return response.status(403).json({message: "Access denied. You are not authorized to access this resource."});
        }

        const teacher: UserEntity | null = await userRepository.findOne({where: {id: teacherId, role: "teacher"}});

        if (!teacher) {
            return response.status(404).json({message: "Teacher not found"});
        }

        if (teacher.classroom) {
            return response.status(400).json({message: "Teacher is already in a classroom"});
        }

        const classroom: ClassroomEntity | null = await classroomRepository.findOne({where: {id: 1}});

        if (!classroom) {
            return response.status(404).json({message: "Classroom not found"});
        }

        teacher.classroom = classroom;
        await userRepository.save(teacher);
        return response.status(200).send("Teacher added to classroom successfully.");
    } catch (error) {
        next(error);
    }
}

export async function removeStudentFromClassroom(request: Request, response: Response, next: NextFunction) {
    try {
        const decodedJwt = await verifyToken(request);
        if (!decodedJwt) {
            return response.status(401).json({message: "Unauthorized"});
        }

        const studentId: number = parseInt(<string>request.params.studentId);
        if (decodedJwt.role !== "teacher" && decodedJwt.role !== "admin") {
            return response.status(403).json({message: "Access denied. You are not authorized to access this resource."});
        }

        const student: UserEntity | null = await userRepository.findOne({where: {id: studentId, role: "student"}});

        if (!student) {
            return response.status(404).json({message: "Student not found"});
        }

        if (student.classroom === null) {
            return response.status(400).json({message: "Student is not in a classroom"});
        }

        student.classroom = null;
        await userRepository.save(student);
        return response.status(200).send("Student removed from classroom successfully.");
    } catch (error) {
        next(error);
    }
}

export async function removeTeacherFromClassroom(request: Request, response: Response, next: NextFunction) {
    try {
        const decodedJwt = await verifyToken(request);
        if (!decodedJwt) {
            return response.status(401).json({message: "Unauthorized"});
        }

        const teacherId: number = parseInt(<string>request.params.teacherId);
        if (decodedJwt.role !== "teacher" && decodedJwt.role !== "admin") {
            return response.status(403).json({message: "Access denied. You are not authorized to access this resource."});
        }

        const teacher: UserEntity | null = await userRepository.findOne({where: {id: teacherId, role: "teacher"}});

        if (!teacher) {
            return response.status(404).json({message: "Teacher not found"});
        }

        if (teacher.classroom === null) {
            return response.status(400).json({message: "Teacher is not in a classroom"});
        }

        teacher.classroom = null;
        await userRepository.save(teacher);
        return response.status(200).send("Teacher removed from classroom successfully.");
    } catch (error) {
        next(error);
    }
}