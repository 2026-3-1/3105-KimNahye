import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Enrollment } from './entities/enrollment.entity';
import { UserService } from 'src/user/user.service';
import { CourseService } from 'src/courses/course.service';
import {
  ENROLLMENT_REPOSITORY,
  IEnrollmentRepository,
} from './interfaces/enrollment-repository.interface';

@Injectable()
export class EnrollmentService {
  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly userService: UserService,
    private readonly courseService: CourseService,
  ) {}

  async enroll(userId: string, courseId: string): Promise<Enrollment> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }

    const course = await this.courseService.findById(courseId);
    if (!course) {
      throw new NotFoundException('존재하지 않는 강좌입니다.');
    }

    const existing = (await this.enrollmentRepository.findByUserAndCourse(
      user,
      course,
    )) as Enrollment;
    if (existing) {
      throw new ConflictException('이미 수강 신청된 강좌입니다.');
    }

    const enrollment = (await this.enrollmentRepository.create(
      user,
      course,
    )) as Enrollment;

    if (!enrollment) {
      throw new InternalServerErrorException(
        '서버 오류: 수강 신청이 완료되지 않았습니다.',
      );
    }

    return enrollment;
  }
}
