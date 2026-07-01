import {NextFunction, Response, Request} from "express";

import {classroomRepository} from "../database/repositories/classroom.repository"
import {ClassroomEntity} from "../database/models/classroom.entity";
import {ForbiddenError, NotFoundError, UnauthorizedError, ValidationError} from "../errors/app-error";
import {JwtPayload, verifyToken} from "../util/jwt.util";

type Classroom = {
    id: number;
    name: string;
}

async function getNumberOfClasses() {
    return classroomRepository.count();
}

export async function createClass(request: Request, response: Response, next: NextFunction) {
    try {
        const decodedJwt: JwtPayload | null = await verifyToken(request);
        if (!decodedJwt) {
            throw new UnauthorizedError();
        }

        if (decodedJwt.role !== "admin" && decodedJwt.role !== "teacher") {
            throw new ForbiddenError("Access denied. You are not authorized to access this resource.");
        }

        console.log(
            "decodedJwt.role: ", decodedJwt.role,
            "decodedJwt.id: ", decodedJwt.id,
            "decodedJwt.email: ", decodedJwt.email
        )

        const numberOfClasses: number = await getNumberOfClasses();
        if (numberOfClasses > 0) {
            throw new ValidationError("Classroom already exists");
        }

        const {name} = request.body;
        if (!name) {
            throw new ValidationError("Name is required");
        }

        const classroom: ClassroomEntity = classroomRepository.create({name});
        const savedClassroom = await classroomRepository.save(classroom);
        return response.status(201).json(savedClassroom);
    } catch (error) {
        next(error);
    }
}

export async function getClass(request: Request, response: Response, next: NextFunction) {
    try {
        const classes: Classroom[] = await classroomRepository.find();
        if (classes.length === 0) {
            throw new NotFoundError("No classrooms found");
        } else if (classes.length > 1) {}

        const classroom: Classroom | null | undefined = classes[0];
        if (!classroom) {
            throw new NotFoundError("Classroom not found");
        }
        return response.status(200).json(classroom);
    } catch (error) {
        next(error);
    }
}

export async function getClassByUserId(request: Request, response: Response, next: NextFunction) {
    try {
        const decodedJwt: JwtPayload | null = await verifyToken(request);
        if (!decodedJwt) {
            throw new UnauthorizedError();
        }

        const userId: number = parseInt(<string>request.params.userId);

        if (decodedJwt.id !== userId) {
            throw new ForbiddenError("Access denied. You are not authorized to access this resource.");
        }

        const classroom: Classroom | null = await classroomRepository.findOne({where: {users: {id: userId}}});
        if (!classroom) {
            throw new NotFoundError("Classroom not found");
        }
        return response.status(200).json(classroom);
    } catch (error) {
        next(error);
    }
}

export async function deleteClass(request: Request, response: Response, next: NextFunction) {
    try {
        await classroomRepository.clear();
        return response.status(204).end();
    } catch (error) {
        next(error);
    }
}