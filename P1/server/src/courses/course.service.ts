import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
import { Video } from 'src/videos/entities/video.entity';
import { CreateCourseRequest } from './dto/create-course-request.dto';
import { UserRole } from '@common/enums/user-role.enum';

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

  async findByVideo(video: Video): Promise<Course | null> {
    return this.courseRepository.findByVideo(video);
  }

  async create(dto: CreateCourseRequest, userId: string): Promise<void> {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }

    if (user.role !== UserRole.TEACHER) {
      throw new ForbiddenException('수강 등록은 선생님만 할 수 있습니다.');
    }

    const newCourse = await this.courseRepository.create(
      user,
      dto.category,
      dto.difficulty,
      dto.requiredTools,
    );

    if (!newCourse) {
      throw new InternalServerErrorException(
        '서버 오류: 강의 등록에 실패하였습니다.',
      );
    }
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
