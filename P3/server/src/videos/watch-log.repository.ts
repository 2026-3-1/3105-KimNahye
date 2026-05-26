import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { VideoWatchLog } from './entities/video-watch-log.entity';
import { IWatchLogRepository } from './interfaces/watch-log-repository.interface';
import { User } from 'src/user/entities/user.entity';
import { Video } from './entities/video.entity';

@Injectable()
export class WatchLogRepository implements IWatchLogRepository {
  constructor(
    @InjectRepository(VideoWatchLog)
    private readonly repo: Repository<VideoWatchLog>,
  ) {}

  async findByUserAndVideo(user: User, video: Video): Promise<VideoWatchLog | null> {
    return this.repo.findOne({
      where: { user: { id: user.id }, video: { id: video.id } },
    });
  }

  async upsert(
    user: User,
    video: Video,
    watchedDuration: number,
    isCompleted: boolean,
  ): Promise<VideoWatchLog> {
    let log = await this.findByUserAndVideo(user, video);
    if (log) {
      log.watchedDuration = watchedDuration;
      log.isCompleted = isCompleted || log.isCompleted;
    } else {
      log = this.repo.create({ user, video, watchedDuration, isCompleted });
    }
    return this.repo.save(log);
  }

  async countCompleted(userId: string, videoIds: string[]): Promise<number> {
    if (videoIds.length === 0) return 0;
    return this.repo.count({
      where: {
        user: { id: userId },
        video: { id: In(videoIds) },
        isCompleted: true,
      },
    });
  }
}
