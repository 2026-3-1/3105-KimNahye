import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IVideoRepository,
  VIDEO_REPOSITORY,
} from './interfaces/video-repository.interface';
import { GetVideoDetailResponse } from './dto/get-video-detail.dto';
import { Video } from './entities/video.entity';

@Injectable()
export class VideoService {
  constructor(
    @Inject(VIDEO_REPOSITORY)
    private readonly videoRepository: IVideoRepository,
  ) {}

  async getVideoDetail(id: string): Promise<GetVideoDetailResponse> {
    const video = (await this.videoRepository.findById(id)) as Video;

    if (!video) {
      throw new NotFoundException('영상을 찾을 수 없습니다.');
    }

    return {
      id: video.id,
      youtubeVideoId: video.youtubeVideoId,
      title: video.title,
      duration: video.duration,
    };
  }
}
