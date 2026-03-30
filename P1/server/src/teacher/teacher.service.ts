import { UserRole } from '@common/enums/user-role.enum';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CourseService } from 'src/courses/course.service';
import { CourseListResponse } from 'src/courses/dto/course-list-response.dto';
import { CreateCourseRequest } from 'src/courses/dto/create-course-request.dto';
import { CreateCourseResponse } from 'src/courses/dto/create-course-response.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TeacherService {
  constructor(
    private readonly userService: UserService,
    private readonly courseService: CourseService,
  ) {}

  async create(
    dto: CreateCourseRequest,
    userId: string,
  ): Promise<CreateCourseResponse> {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }

    if (user.role !== UserRole.TEACHER) {
      throw new ForbiddenException('수강 등록은 선생님만 할 수 있습니다.');
    }

    const newCourse = await this.courseService.create(user, dto);

    if (!newCourse) {
      throw new InternalServerErrorException(
        '서버 오류: 강의 등록에 실패하였습니다.',
      );
    }

    return {
      id: newCourse.id,
    };
  }

  async getCourseListByTeacher(
    userId: string,
  ): Promise<CourseListResponse[] | null> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('유저가 존재하지 않습니다.');
    }

    const courses = await this.courseService.findAllByTeacher(user);

    if (!courses || courses.length === 0) return null;

    return courses.map((course) => {
      return {
        id: course.id,
        teacher: {
          id: course.teacher.id,
          name: course.teacher.nickname,
        },
        videoCount: course.computedVideoCount ?? 0,
        category: course.category,
        difficulty: course.difficulty,
        requiredTools: course.requiredTools,
      };
    });
  }
}
