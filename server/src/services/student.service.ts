import {NextFunction, Response, Request} from "express";

import {userRepository} from "../database/repositories/user.repository"
import {UserEntity} from "../database/models/user.entity";
import {ForbiddenError, NotFoundError, UnauthorizedError, ValidationError} from "../errors/app-error";
import {JwtPayload, verifyToken} from "../util/jwt.util";

type Student = {
    id: number;
    name: string;
    email: string;
    role: string;
}

type StudentRequest = {
    name: string;
    email: string;
    role: string;
}

export async function getStudents(request: Request, response: Response, next: NextFunction) {
    try {
        const students: Student[] = await userRepository.find({where: {role: "student"}});
        return response.status(200).json(students);
    } catch (error) {
        next(error);
    }
}

export async function getStudentById(request: Request, response: Response, next: NextFunction) {
    try {
        const decodedJwt: JwtPayload | null = await verifyToken(request);

        if (!decodedJwt) {
            throw new UnauthorizedError();
        }

        console.log(decodedJwt);

        const id: number = parseInt(<string>request.params.studentId);

        if (decodedJwt.id !== id || decodedJwt.role !== "student") {
            throw new ForbiddenError("Access denied. You are not authorized to access this resource.");
        }

        const student: Student | null = await userRepository.findOne({where: {id: id, role: "student"}});
        if (!student) {
            throw new NotFoundError("Student not found");
        }
        return response.status(200).json(student);
    } catch (error) {
        next(error);
    }
}

export async function createStudent(request: Request, response: Response, next: NextFunction) {
    try {
        const student: StudentRequest = request.body;

        const studentExists: Student | null = await userRepository.findOne({where: {email: student.email}});
        if (studentExists) {
            throw new ValidationError("User with this email is already registered");
        }

        const newStudent: UserEntity = userRepository.create(student);
        const savedStudent: UserEntity = await userRepository.save(newStudent);
        return response.status(201).json(savedStudent);
    } catch (error) {
        next(error);
    }
}

export async function getStudentsByClassroomId(request: Request, response: Response, next: NextFunction) {
    try {
        const classroomId: number = 1;
        const students: Student[] = await userRepository.find({where: {classroom: {id: classroomId}, role: "student"}});
        return response.status(200).json(students);
    } catch (error) {
        next(error);
    }
}
