import {NextFunction, Response, Request} from "express";

import {userRepository} from "../database/repositories/user.repository"
import {UserEntity} from "../database/models/user.entity";

import {ForbiddenError, NotFoundError, UnauthorizedError, ValidationError} from "../errors/app-error";
import {classroomRepository} from "../database/repositories/classroom.repository"
import {ClassroomEntity} from "../database/models/classroom.entity";
import {JwtPayload, verifyToken} from "../util/jwt.util";

export async function addStudentToClassroom(request: Request, response: Response, next: NextFunction) {
    try {
        const decodedJwt = await verifyToken(request);
        if (!decodedJwt) {
            throw new UnauthorizedError();
        }

        if (!request.params || !request.params.studentId) {
            throw new ValidationError("studentId is required");
        }

        const studentId: number = parseInt(<string>request.params.studentId)
        if (!accessGranted(decodedJwt)) {
            throw new ForbiddenError("Access denied. You are not authorized to access this resource.");
        }

        const student: UserEntity | null = await userRepository.findOne({where: {id: studentId, role: "student"}});

        if (!student) {
            throw new NotFoundError("Student not found");
        }

        if (student.classroom) {
            throw new ValidationError("Student is already in a classroom");
        }

        const classroom: ClassroomEntity | null = await classroomRepository.findOne({where: {id: 1}});

        if (!classroom) {
            throw new NotFoundError("Classroom not found");
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
            throw new UnauthorizedError();
        }

        if (!request.params || !request.params.teacherId) {
            throw new ValidationError("teacherId is required");
        }

        const teacherId: number = parseInt(<string>request.params.teacherId)
        if (!accessGranted(decodedJwt)) {
            throw new ForbiddenError("Access denied. You are not authorized to access this resource.");
        }

        const teacher: UserEntity | null = await userRepository.findOne({where: {id: teacherId, role: "teacher"}});

        if (!teacher) {
            throw new NotFoundError("Teacher not found");
        }

        if (teacher.classroom) {
            throw new ValidationError("Teacher is already in a classroom");
        }

        const classroom: ClassroomEntity | null = await classroomRepository.findOne({where: {id: 1}});

        if (!classroom) {
            throw new NotFoundError("Classroom not found");
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
            throw new UnauthorizedError();
        }

        if (!request.params || !request.params.studentId) {
            throw new ValidationError("studentId is required");
        }

        const studentId: number = parseInt(<string>request.params.studentId);
        if (!accessGranted(decodedJwt)) {
            throw new ForbiddenError("Access denied. You are not authorized to access this resource.");
        }

        const student: UserEntity | null = await userRepository.findOne({where: {id: studentId, role: "student"}});

        if (!student) {
            throw new NotFoundError("Student not found");
        }

        if (student.classroom === null) {
            throw new ValidationError("Student is not in a classroom");
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
        const decodedJwt: JwtPayload | null = await verifyToken(request);
        if (!decodedJwt) {
            throw new UnauthorizedError();
        }

        if (!request.params || !request.params.teacherId) {
            throw new ValidationError("teacherId is required");
        }

        const teacherId: number = parseInt(<string>request.params.teacherId);
        if (!accessGranted(decodedJwt)) {
            throw new ForbiddenError("Access denied. You are not authorized to access this resource.");
        }

        const teacher: UserEntity | null = await userRepository.findOne({where: {id: teacherId, role: "teacher"}});

        if (!teacher) {
            throw new NotFoundError("Teacher not found");
        }

        if (teacher.classroom === null) {
            throw new ValidationError("Teacher is not in a classroom");
        }

        teacher.classroom = null;
        await userRepository.save(teacher);
        return response.status(200).send("Teacher removed from classroom successfully.");
    } catch (error) {
        next(error);
    }
}

function accessGranted(decodedJwt: JwtPayload) {
    return decodedJwt.role === "teacher" || decodedJwt.role === "admin";
}