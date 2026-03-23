import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Video } from '../../videos/entities/video.entity';
import { Category } from './enums/category.enum';
import { Difficulty } from './enums/difficulty.enum';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.courses, { nullable: false })
  teacher: User;

  @OneToMany(() => Video, (video) => video.course)
  videos: Video[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Enrollment[];

  @Column()
  category: Category;

  @Column()
  difficulty: Difficulty;

  @Column({ type: 'jsonb' })
  requiredTools: string[];

  videoCount?: number;

  totalDuration?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get computedVideoCount(): number {
    return this.videos?.length ?? 0;
  }

  get computedTotalDuration(): number {
    return this.videos?.reduce((sum, video) => sum + video.duration, 0) ?? 0;
  }
}
