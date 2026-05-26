import { User } from 'src/user/entities/user.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Review } from '../entities/review.entity';

export interface IReviewRepository {
  findByCourse(courseId: string): Promise<Review[]>;
  findByUserAndCourse(user: User, course: Course): Promise<Review | null>;
  findById(id: string): Promise<Review | null>;
  create(user: User, course: Course, rating: number, content: string): Promise<Review>;
  update(id: string, rating: number, content: string): Promise<Review>;
  delete(id: string): Promise<void>;
}

export const REVIEW_REPOSITORY = Symbol('IReviewRepository');
