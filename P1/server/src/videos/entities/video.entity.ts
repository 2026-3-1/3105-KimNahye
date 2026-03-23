import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from '../../courses/entities/course.entity';

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  youtubeVideoId: string; // youtube 연결용

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  duration: number;

  @ManyToOne(() => User, (user) => user.videos, { nullable: false })
  teacher: User;

  @ManyToOne(() => Course, (course) => course.videos, { nullable: false })
  course: Course;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
