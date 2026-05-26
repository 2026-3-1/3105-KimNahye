import { Course } from 'src/courses/entities/course.entity';
import { User } from 'src/user/entities/user.entity';

export interface IVideoRepository {
  findById(id: string);
  create(
    youtubeVideoId: string,
    title: string,
    duration: number,
    teacher: User,
    course: Course,
  );
}

export const VIDEO_REPOSITORY = Symbol('IVideoRepository');
