import {NextFunction, Response, Request} from "express";

import {userRepository} from "../database/repositories/user.repository"
import {UserEntity} from "../database/models/user.entity";

import {classroomRepository} from "../database/repositories/classroom.repository"
import {ClassroomEntity} from "../database/models/classroom.entity";

export async function addStudentToClassroom(request: Request, response: Response, next: NextFunction) {
    try {
        const classroomId: number = parseInt(<string>request.params.classroomId)
        const classroom: ClassroomEntity | null = await classroomRepository.findOne({where: {id: classroomId}});

        if (!classroom) {
            return response.status(404).json({message: "Classroom not found"});
        }

        const studentId: number = parseInt(<string>request.params.studentId)
        const student: UserEntity | null = await userRepository.findOne({where: {id: studentId}});

        if (!student) {
            return response.status(404).json({message: "Student not found"});
        }

        student.classroom = classroom;
        await userRepository.save(student);
        return response.status(200).send("Student added to classroom successfully.");
    } catch (error) {
        next(error);
    }
}
