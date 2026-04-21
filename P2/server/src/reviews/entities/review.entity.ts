import { Course } from 'src/courses/entities/course.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('reviews')
@Unique(['user', 'course'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @ManyToOne(() => Course, { nullable: false })
  course: Course;

  @Column({ type: 'smallint' })
  rating: number;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
