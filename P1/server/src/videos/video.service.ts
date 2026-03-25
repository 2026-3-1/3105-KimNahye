import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  IVideoRepository,
  VIDEO_REPOSITORY,
} from './interfaces/video-repository.interface';
import { GetVideoDetailResponse } from './dto/get-video-detail.dto';
import { Video } from './entities/video.entity';
import { CourseService } from 'src/courses/course.service';
import { UserService } from 'src/user/user.service';
import { EnrollmentService } from 'src/enrollments/enrollment.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UserRole } from '@common/enums/user-role.enum';
import { CreateVideoReponseDto } from './dto/create-video-response.dto';

@Injectable()
export class VideoService {
  constructor(
    @Inject(VIDEO_REPOSITORY)
    private readonly videoRepository: IVideoRepository,
    private readonly courseService: CourseService,
    private readonly userService: UserService,
    private readonly enrollmentService: EnrollmentService,
  ) {}

  async getVideoDetail(
    id: string,
    userId: string,
  ): Promise<GetVideoDetailResponse> {
    const video = (await this.videoRepository.findById(id)) as Video;

    if (!video) {
      throw new NotFoundException('영상을 찾을 수 없습니다.');
    }

    const course = await this.courseService.findByVideo(video);

    if (!course) {
      throw new NotFoundException('해당 영상의 강좌를 찾을 수 없습니다.');
    }

    const user = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }
    const enrollment = await this.enrollmentService.findByUserAndCourse(
      user,
      course,
    );

    if (!enrollment) {
      throw new ForbiddenException('수강 신청 후 이용 가능합니다.');
    }

    return {
      id: video.id,
      youtubeVideoId: video.youtubeVideoId,
      title: video.title,
      duration: video.duration,
    };
  }

  async create(
    createVideoDto: CreateVideoDto,
    userId: string,
  ): Promise<CreateVideoReponseDto> {
    const teacher = await this.userService.findById(userId);

    if (!teacher) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    // 1. teacher 역할 검증
    if (teacher.role !== UserRole.TEACHER) {
      throw new ForbiddenException('강사만 영상을 등록할 수 있습니다.');
    }

    // 2. 코스 존재 여부 확인
    const course = await this.courseService.findById(createVideoDto.courseId);
    if (!course) {
      throw new NotFoundException(
        `ID ${createVideoDto.courseId}에 해당하는 코스를 찾을 수 없습니다.`,
      );
    }

    // 3. 코스 소유자 검증 (본인 코스에만 영상 등록 가능)
    if (course.teacher.id !== teacher.id) {
      throw new ForbiddenException(
        '본인의 코스에만 영상을 등록할 수 있습니다.',
      );
    }

    // 4. 영상 생성 및 저장
    const video = this.videoRepository.create(
      createVideoDto.youtubeVideoId,
      createVideoDto.title,
      createVideoDto.duration,
      teacher,
      course,
    ) as Video;

    return {
      id: video.id,
      youtubeVideoId: video.youtubeVideoId,
      title: video.title,
      duration: video.duration,
      created_at: video.createdAt,
    };
  }
}
