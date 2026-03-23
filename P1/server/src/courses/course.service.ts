import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  COURSE_REPOSITORY,
  ICourseRepository,
} from './interfaces/courses-repository.interface';

import { CourseQueryDto } from './dto/course-query.dto';
import { CourseListResponse } from './dto/course-list-response.dto';
import { CourseDetailResponse } from './dto/course-detail.response.dto';
import { Course } from './entities/course.entity';
import { VideoItem } from './dto/video-item.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class CourseService {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    private readonly userService: UserService,
  ) {}

  async findById(id: string): Promise<Course | null> {
    return this.courseRepository.findById(id);
  }

  async getCourseList(
    dto: CourseQueryDto,
  ): Promise<CourseListResponse[] | null> {
    const { category, difficulty, requiredTools, duration, page, limit } = dto;

    const courseList = await this.courseRepository.findByQuery(
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
    const course = (await this.courseRepository.findById(id)) as Course;

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
    const user = await this.userService.findById(userId);
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
