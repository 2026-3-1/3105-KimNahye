import { User } from 'src/user/entities/user.entity';
import { Video } from 'src/videos/entities/video.entity';
import { Bookmark } from '../entities/bookmark.entity';

export interface IBookmarkRepository {
  findByUserAndVideo(user: User, video: Video): Promise<Bookmark[]>;
  findById(id: string): Promise<Bookmark | null>;
  create(user: User, video: Video, positionSec: number, note?: string): Promise<Bookmark>;
  updateNote(id: string, note: string): Promise<Bookmark>;
  delete(id: string): Promise<void>;
}

export const BOOKMARK_REPOSITORY = Symbol('IBookmarkRepository');
