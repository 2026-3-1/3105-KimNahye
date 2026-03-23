import { Course } from 'src/courses/entities/course.entity';
import { User } from 'src/user/entities/user.entity';
import { Video } from 'src/videos/entities/video.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.enrollments)
  user: User;

  @ManyToOne(() => Course, (course) => course.enrollments)
  course: Course;

  @Column({ nullable: false, default: false })
  isCompleted: boolean;

  @CreateDateColumn()
  enrolledAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @ManyToMany(() => Video)
  @JoinTable()
  watchedVideos: Video[];
}
