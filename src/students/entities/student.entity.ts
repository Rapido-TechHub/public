import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Grade } from "./grade.entity";

@Entity("students")
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @Column({ type: "varchar", length: 160, nullable: true, unique: true })
  email: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Grade, (grade) => grade.student, { cascade: true })
  grades: Grade[];
}
