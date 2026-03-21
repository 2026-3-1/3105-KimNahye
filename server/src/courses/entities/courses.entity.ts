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
import { Videos } from '../../videos/entities/videos.entity';
import { Category } from './enums/category.enum';
import { Difficulty } from './enums/difficulty.enum';

@Entity()
export class Courses {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.courses, { nullable: false })
  teacher: User;

  @OneToMany(() => Videos, (video) => video.course)
  videos: Videos[];

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
