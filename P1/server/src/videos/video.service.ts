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
}
