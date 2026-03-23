import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IVideosRepository,
  VIDEOS_REPOSITORY,
} from './interfaces/video-repository.interface';
import { GetVideoDetailResponse } from './dto/get-video-detail.dto';
import { Videos } from './entities/videos.entity';

@Injectable()
export class VideosService {
  constructor(
    @Inject(VIDEOS_REPOSITORY)
    private readonly videosRepository: IVideosRepository,
  ) {}

  async getVideoDetail(id: string): Promise<GetVideoDetailResponse> {
    const video = (await this.videosRepository.findById(id)) as Videos;

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
