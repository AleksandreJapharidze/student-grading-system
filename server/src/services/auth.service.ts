import {NextFunction, Response, Request} from "express";
import bcrypt from "bcrypt"

import {userRepository} from "../database/repositories/user.repository";
import {UserEntity} from "../database/models/user.entity";
import {ForbiddenError, NotFoundError, UnauthorizedError, ValidationError} from "../errors/app-error";

import {generateToken} from "../util/jwt.util";

export async function registerStudent(request: Request, response: Response, next: NextFunction) {
    try {
        const {name} = request.body;
        const {email} = request.body;

        if (!name || !email) {
            throw new ValidationError("Name and email are required");
        }

        const studentExists: UserEntity | null = await userRepository.findOne({where: {email: email}});
        if (studentExists) {
            throw new ValidationError("User with this email is already registered");
        }

        const {password} = request.body;

        if (!password) {
            throw new ValidationError("Password is required");
        }

        const hashedPassword: string = await bcrypt.hash(password, 10);
        const newStudent: UserEntity = userRepository.create({name, email, password: hashedPassword, role: "student"});
        await userRepository.save(newStudent);

        return response.status(201).send({message: "Student registered successfully"});
    } catch (error) {
        next(error);
    }
}

export async function login(request: Request, response: Response, next: NextFunction) {
    try {
        const {email} = request.body;
        const {password} = request.body;

        if (!email || !password) {
            throw new ValidationError("Email and password are required");
        }

        const user: UserEntity | null = await userRepository.findOne({where: {email: email}, select: {id: true, email: true, password: true, role: true}});
        if (!user) {
            throw new UnauthorizedError("Invalid email. User not found");
        }

        const isPasswordValid: boolean = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError("Invalid password");
        }

        const token: string = await generateToken({id: user.id, email: user.email, role: user.role});

        return response.status(200).send({message: "Login successful", token: token});
    } catch (error) {
        next(error);
    }
}

export async function registerTeacher(request: Request, response: Response, next: NextFunction) {
    try {
        const {name} = request.body;
        const {email} = request.body;

        if (!name || !email) {
            throw new ValidationError("Name and email are required");
        }

        const teacherExists: UserEntity | null = await userRepository.findOne({where: {email: email}});
        if (teacherExists) {
            throw new ValidationError("User with this email is already registered");
        }

        const {password} = request.body;

        if (!password) {
            throw new ValidationError("Password is required");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newTeacher: UserEntity = userRepository.create({name, email, password: hashedPassword, role: "teacher"});
        const savedTeacher: UserEntity = await userRepository.save(newTeacher);
        return response.status(201).send({message: "Teacher registered successfully"});
    } catch (error) {
        next(error);
    }
}
