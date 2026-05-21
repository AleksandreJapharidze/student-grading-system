import {NextFunction, Response, Request} from "express";
import bcrypt from "bcrypt"

import {userRepository} from "../database/repositories/user.repository";
import {UserEntity} from "../database/models/user.entity";

import {generateToken} from "../util/jwt.util";

export async function registerStudent(request: Request, response: Response, next: NextFunction) {
    try {
        const {name} = request.body;
        const {email} = request.body;

        const studentExists: UserEntity | null = await userRepository.findOne({where: {email: email}});
        if (studentExists) {
            return response.status(400).json({message: "User with this email is already registered"});
        }

        const {password} = request.body;

        const hashedPassword: string = await bcrypt.hash(password, 10);
        const newStudent: UserEntity = userRepository.create({name, email, password: hashedPassword, role: "student"});
        const savedStudent: UserEntity = await userRepository.save(newStudent);
        return response.status(201).send({message: "Student registered successfully"});
    } catch (error) {
        next(error);
    }
}

export async function login(request: Request, response: Response, next: NextFunction) {
    try {
        const {email} = request.body;
        const {password} = request.body;

        const user: UserEntity | null = await userRepository.findOne({where: {email: email}, select: {id: true, email: true, password: true, role: true}});
        if (!user) {
            return response.status(401).json({message: "Invalid email. User not found"});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return response.status(401).json({message: "Invalid password"});
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

        const teacherExists: UserEntity | null = await userRepository.findOne({where: {email: email}});
        if (teacherExists) {
            return response.status(400).json({message: "User with this email is already registered"});
        }

        const {password} = request.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        const newTeacher: UserEntity = userRepository.create({name, email, password: hashedPassword, role: "teacher"});
        const savedTeacher: UserEntity = await userRepository.save(newTeacher);
        return response.status(201).send({message: "Teacher registered successfully"});
    } catch (error) {
        next(error);
    }
}
