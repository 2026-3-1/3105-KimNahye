import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Videos } from '../../videos/entities/videos.entity';
import { Category } from './enums/category.enum';
import { Difficulty } from './enums/difficulty.enum';

@Entity()
export class Courses {
  @PrimaryGeneratedColumn()
  id: 'uuid';

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
}
