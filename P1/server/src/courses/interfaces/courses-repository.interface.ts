import { Video } from 'src/videos/entities/video.entity';
import { Course } from '../entities/course.entity';
import { Category } from '../entities/enums/category.enum';
import { Difficulty } from '../entities/enums/difficulty.enum';

export interface ICourseRepository {
  findByQuery(
    category?: Category,
    difficulty?: Difficulty,
    requiredTools?: string[],
    duration?: number,
    page?: number,
    limit?: number,
  ): Promise<Course[] | null>;

  findById(id: string): Promise<Course | null>;

  findByVideo(video: Video): Promise<Course | null>;
}

export const COURSE_REPOSITORY = Symbol('ICourseRepository');
