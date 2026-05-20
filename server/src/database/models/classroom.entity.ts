import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

import {UserEntity} from "./user.entity"
import {AssignmentEntity} from "./assignment.entity";

@Entity()
export class ClassroomEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, type: "varchar"})
    name: string;

    @OneToMany(() => UserEntity, user => user.classroom)
    users: UserEntity[];

    @OneToMany(() => AssignmentEntity, assignment => assignment.classroom)
    assignments: AssignmentEntity[];
}