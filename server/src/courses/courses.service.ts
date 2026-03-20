import { Inject, Injectable } from '@nestjs/common';
import {
  COURSES_REPOSITORY,
  ICoursesRepository,
} from './interfaces/courses-repository.interface';

import { CourseQueryDto } from './dto/course-query.dto';
import { CourseListResponse } from './dto/course-list-response.dto';

@Injectable()
export class CoursesService {
  constructor(
    @Inject(COURSES_REPOSITORY)
    private readonly coursesRepository: ICoursesRepository,
  ) {}

  async getCourseList(
    dto: CourseQueryDto,
  ): Promise<CourseListResponse[] | null> {
    const { category, difficulty, tools, max_duration, page, limit } = dto;

    const courseList = await this.coursesRepository.findByQuery(
      category,
      difficulty,
      tools,
      max_duration,
      page,
      limit,
    );

    if (!courseList) return null;

    return courseList.map((course) => ({
      id: course.id,
      teacher: {
        id: course.teacher.id,
        name: course.teacher.nickname,
      },
      videoCount: course.videoCount ?? 0,
      category: course.category,
      difficulty: course.difficulty,
      requiredTools: course.requiredTools,
    }));
  }
}
