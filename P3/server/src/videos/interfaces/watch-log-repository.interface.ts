import { User } from 'src/user/entities/user.entity';
import { Video } from '../entities/video.entity';
import { VideoWatchLog } from '../entities/video-watch-log.entity';

export interface IWatchLogRepository {
  findByUserAndVideo(user: User, video: Video): Promise<VideoWatchLog | null>;
  upsert(
    user: User,
    video: Video,
    watchedDuration: number,
    isCompleted: boolean,
  ): Promise<VideoWatchLog>;
  countCompleted(userId: string, videoIds: string[]): Promise<number>;
}

export const WATCH_LOG_REPOSITORY = Symbol('IWatchLogRepository');
