import { Course } from 'src/courses/entities/course.entity';
import { User } from 'src/user/entities/user.entity';

export interface IEnrollmentRepository {
  findByUserAndCourse(user: User, course: Course);
  create(user: User, course: Course);
}

export const ENROLLMENT_REPOSITORY = Symbol('IEnrollmentRepository');
