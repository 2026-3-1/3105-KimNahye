import { Course } from 'src/courses/entities/course.entity';
import { User } from 'src/user/entities/user.entity';
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('cart_items')
@Unique(['user', 'course'])
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Course, { nullable: false })
  course: Course;

  @CreateDateColumn({ name: 'added_at' })
  addedAt: Date;
}
