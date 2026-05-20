import {NextFunction, Response, Request} from "express";

import {userRepository} from "../database/repositories/user.repository"
import {UserEntity} from "../database/models/user.entity";

import {classroomRepository} from "../database/repositories/classroom.repository"
import {ClassroomEntity} from "../database/models/classroom.entity";

export async function addStudentToClassroom(request: Request, response: Response, next: NextFunction) {
    try {
        const classroom: ClassroomEntity | null = await classroomRepository.findOne({where: {id: 1}});

        if (!classroom) {
            return response.status(404).json({message: "Classroom not found"});
        }

        const studentId: number = parseInt(<string>request.params.studentId)
        const student: UserEntity | null = await userRepository.findOne({where: {id: studentId}});

        if (!student) {
            return response.status(404).json({message: "Student not found"});
        }

        if (student.role !== "student") {
            return response.status(400).json({message: "Student must have a role of 'student'"});
        }

        if (student.classroom) {
            return response.status(400).json({message: "Student is already in a classroom"});
        }

        student.classroom = classroom;
        await userRepository.save(student);
        return response.status(200).send("Student added to classroom successfully.");
    } catch (error) {
        next(error);
    }
}

export async function removeStudentFromClassroom(request: Request, response: Response, next: NextFunction) {
    try {
        const studentId: number = parseInt(<string>request.params.studentId);
        const student: UserEntity | null = await userRepository.findOne({where: {id: studentId}});

        if (!student) {
            return response.status(404).json({message: "Student not found"});
        }

        if (student.role !== "student") {
            return response.status(400).json({message: "Student must have a role of 'student'"});
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