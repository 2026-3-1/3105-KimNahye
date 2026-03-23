import { Courses } from '../entities/courses.entity';
import { Category } from '../entities/enums/category.enum';
import { Difficulty } from '../entities/enums/difficulty.enum';

export interface ICoursesRepository {
  findByQuery(
    category?: Category,
    difficulty?: Difficulty,
    requiredTools?: string[],
    duration?: number,
    page?: number,
    limit?: number,
  ): Promise<Courses[] | null>;

  findById(id: string): Promise<Courses | null>;
}

export const COURSES_REPOSITORY = Symbol('ICoursesRepository');
