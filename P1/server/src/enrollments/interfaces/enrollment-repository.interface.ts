import { Course } from 'src/courses/entities/course.entity';
import { User } from 'src/user/entities/user.entity';
import { Enrollment } from '../entities/enrollment.entity';

export interface IEnrollmentRepository {
  findByUserAndCourse(user: User, course: Course): Promise<Enrollment | null>;
  create(user: User, course: Course): Promise<Enrollment | null>;
  findAllByUser(user: User): Promise<Enrollment[] | null>;
}

export const ENROLLMENT_REPOSITORY = Symbol('IEnrollmentRepository');
