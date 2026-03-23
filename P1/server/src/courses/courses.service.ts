import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  COURSES_REPOSITORY,
  ICoursesRepository,
} from './interfaces/courses-repository.interface';

import { CourseQueryDto } from './dto/course-query.dto';
import { CourseListResponse } from './dto/course-list-response.dto';
import { CourseDetailResponse } from './dto/course-detail.response.dto';
import { Courses } from './entities/courses.entity';
import { VideoItem } from './dto/video-item.dto';
import { UsersService } from 'src/user/user.service';

@Injectable()
export class CoursesService {
  constructor(
    @Inject(COURSES_REPOSITORY)
    private readonly coursesRepository: ICoursesRepository,
    private readonly usersService: UsersService,
  ) {}

  async getCourseList(
    dto: CourseQueryDto,
  ): Promise<CourseListResponse[] | null> {
    const { category, difficulty, requiredTools, duration, page, limit } = dto;

    const courseList = await this.coursesRepository.findByQuery(
      category,
      difficulty,
      requiredTools,
      duration,
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
      videoCount: course.computedVideoCount ?? 0,
      category: course.category,
      difficulty: course.difficulty,
      requiredTools: course.requiredTools,
    }));
  }

  async getCourseDetail(id: string): Promise<CourseDetailResponse> {
    const course = (await this.coursesRepository.findById(id)) as Courses;

    if (!course) {
      throw new NotFoundException('강의를 찾을 수 없습니다.');
    }

    const videoItems: VideoItem[] = course.videos.map((video) => ({
      id: video.id,
      title: video.title,
      duration: video.duration,
    }));
    return {
      id: course.id,
      teacher: {
        id: course.teacher.id,
        name: course.teacher.nickname,
      },
      videos: videoItems,
      category: course.category,
      difficulty: course.difficulty,
      requiredTools: course.requiredTools,
      videoCount: course.computedVideoCount ?? 0,
      totalDuration: course.computedTotalDuration ?? 0,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }

  async getCourseListByUser(
    userId: string,
  ): Promise<CourseListResponse[] | null> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('유저가 존재하지 않습니다.');
    }
    const courseList = user.courses;

    if (!courseList) return null;

    return courseList.map((course) => ({
      id: course.id,
      teacher: {
        id: course.teacher.id,
        name: course.teacher.nickname,
      },
      videoCount: course.computedVideoCount ?? 0,
      category: course.category,
      difficulty: course.difficulty,
      requiredTools: course.requiredTools,
    }));
  }
}
