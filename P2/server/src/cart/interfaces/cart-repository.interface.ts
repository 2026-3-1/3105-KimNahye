import { User } from 'src/user/entities/user.entity';
import { Course } from 'src/courses/entities/course.entity';
import { CartItem } from '../entities/cart-item.entity';

export interface ICartRepository {
  findAllByUser(user: User): Promise<CartItem[]>;
  findByUserAndCourse(user: User, course: Course): Promise<CartItem | null>;
  add(user: User, course: Course): Promise<CartItem>;
  removeByUserAndCourse(user: User, course: Course): Promise<void>;
  clearByUser(user: User): Promise<void>;
}

export const CART_REPOSITORY = Symbol('ICartRepository');
