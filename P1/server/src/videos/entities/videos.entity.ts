import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Courses } from '../../courses/entities/courses.entity';

@Entity()
export class Videos {
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

  @ManyToOne(() => Courses, (course) => course.videos, { nullable: false })
  course: Courses;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
