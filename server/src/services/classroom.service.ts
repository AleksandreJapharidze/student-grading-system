import {NextFunction, Response, Request} from "express";

import {classroomRepository} from "../database/repositories/classroom.repository"

type Classroom = {
    id: number;
    name: string;
}

export async function getClasses(request: Request, response: Response, next: NextFunction) {
    try {
        const classes: Classroom[] = await classroomRepository.find();
        return response.status(200).json(classes);
    } catch (error) {
        next(error);
    }
}

export async function createClass(request: Request, response: Response, next: NextFunction) {
    try {
        if (getClasses.length > 0) {
            return response.status(400).json({message: "Classroom already exists"});
        }

        const {name} = request.body;
        const classroom = classroomRepository.create({name});
        const savedClassroom = await classroomRepository.save(classroom);
        return response.status(201).json(savedClassroom);
    } catch (error) {
        next(error);
    }
}

export async function getClass(request: Request, response: Response, next: NextFunction) {
    try {
        const id: number = 1;
        const classroom: Classroom | null = await classroomRepository.findOne({where: {id}});
        if (!classroom) {
            return response.status(404).json({message: "Classroom not found"});
        }
        return response.status(200).json(classroom);
    } catch (error) {
        next(error);
    }
}

export async function getClassByStudentId(request: Request, response: Response, next: NextFunction) {
    try {
        const studentId: number = parseInt(<string>request.params.studentId);
        const classroom: Classroom | null = await classroomRepository.findOne({where: {users: {id: studentId}}});
        if (!classroom) {
            return response.status(404).json({message: "Classroom not found"});
        }
        return response.status(200).json(classroom);
    } catch (error) {
        next(error);
    }
}

export async function deleteClassById(request: Request, response: Response, next: NextFunction) {
    try {
        const id: number = parseInt(<string>request.params.id);
        await classroomRepository.delete(id);
        return response.status(204).end();
    } catch (error) {
        next(error);
    }
}