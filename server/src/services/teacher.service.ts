import {NextFunction, Response, Request} from "express";

import {userRepository} from "../database/repositories/user.repository"
import {UserEntity} from "../database/models/user.entity";

type Teacher = {
    id: number;
    name: string;
    email: string;
    role: string;
}

type TeacherRequest = {
    name: string;
    email: string;
    role: string;
}

export async function getTeachers(request: Request, response: Response, next: NextFunction) {
    try {
        const teachers: Teacher[] = await userRepository.find({where: {role: "teacher"}});
        return response.status(200).json(teachers);
    } catch (error) {
        next(error);
    }
}

export async function getTeacherById(request: Request, response: Response, next: NextFunction) {
    try {
        const id: number = parseInt(<string>request.params.teacherId);
        const teacher: Teacher | null = await userRepository.findOne({where: {id: id, role: "teacher"}});
        if (!teacher) {
            return response.status(404).json({message: "Teacher not found"});
        }
        return response.status(200).json(teacher);
    } catch (error) {
        next(error);
    }
}

export async function createTeacher(request: Request, response: Response, next: NextFunction) {
    try {
        const teacher: TeacherRequest = request.body;
        const newTeacher: UserEntity = userRepository.create(teacher);
        const savedTeacher: UserEntity = await userRepository.save(newTeacher);
        return response.status(201).json(savedTeacher);
    } catch (error) {
        next(error);
    }
}

export async function getTeachersByClassroomId(request: Request, response: Response, next: NextFunction) {
    try {
        const classroomId: number = 1;
        const teachers: Teacher[] = await userRepository.find({where: {classroom: {id: classroomId}, role: "teacher"}});
        return response.status(200).json(teachers);
    } catch (error) {
        next(error);
    }
}
