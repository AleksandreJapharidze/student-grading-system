import {NextFunction, Response, Request} from "express";

import {userRepository} from "../database/repositories/user.repository"
import {UserEntity} from "../database/models/user.entity";

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
        const id: number = parseInt(<string>request.params.studentId);
        const student: Student | null = await userRepository.findOne({where: {id: id, role: "student"}});
        if (!student) {
            return response.status(404).json({message: "Student not found"});
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
            return response.status(400).json({message: "User with this email is already registered"});
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
