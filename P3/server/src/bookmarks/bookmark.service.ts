import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BOOKMARK_REPOSITORY, IBookmarkRepository } from './interfaces/bookmark-repository.interface';
import { UserService } from 'src/user/user.service';
import {
  IVideoRepository,
  VIDEO_REPOSITORY,
} from 'src/videos/interfaces/video-repository.interface';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { BookmarkResponse } from './dto/bookmark-response.dto';

@Injectable()
export class BookmarkService {
  constructor(
    @Inject(BOOKMARK_REPOSITORY)
    private readonly bookmarkRepository: IBookmarkRepository,
    @Inject(VIDEO_REPOSITORY)
    private readonly videoRepository: IVideoRepository,
    private readonly userService: UserService,
  ) {}

  async getBookmarks(userId: string, videoId: string): Promise<BookmarkResponse[]> {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('존재하지 않는 사용자입니다.');

    const video = await this.videoRepository.findById(videoId);
    if (!video) throw new NotFoundException('영상을 찾을 수 없습니다.');

    const bookmarks = await this.bookmarkRepository.findByUserAndVideo(user, video);
    return bookmarks.map((b) => ({
      id: b.id,
      videoId,
      positionSec: b.positionSec,
      note: b.note,
      createdAt: b.createdAt,
    }));
  }

  async createBookmark(userId: string, videoId: string, dto: CreateBookmarkDto): Promise<BookmarkResponse> {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('존재하지 않는 사용자입니다.');

    const video = await this.videoRepository.findById(videoId);
    if (!video) throw new NotFoundException('영상을 찾을 수 없습니다.');

    const bookmark = await this.bookmarkRepository.create(user, video, dto.positionSec, dto.note);
    return {
      id: bookmark.id,
      videoId,
      positionSec: bookmark.positionSec,
      note: bookmark.note,
      createdAt: bookmark.createdAt,
    };
  }

  async updateBookmark(userId: string, bookmarkId: string, dto: UpdateBookmarkDto): Promise<BookmarkResponse> {
    const bookmark = await this.bookmarkRepository.findById(bookmarkId);
    if (!bookmark) throw new NotFoundException('북마크를 찾을 수 없습니다.');
    if (bookmark.user.id !== userId) throw new ForbiddenException('본인의 북마크만 수정할 수 있습니다.');

    const updated = await this.bookmarkRepository.updateNote(bookmarkId, dto.note);
    return {
      id: updated.id,
      videoId: bookmark.video?.id ?? '',
      positionSec: updated.positionSec,
      note: updated.note,
      createdAt: updated.createdAt,
    };
  }

  async deleteBookmark(userId: string, bookmarkId: string): Promise<void> {
    const bookmark = await this.bookmarkRepository.findById(bookmarkId);
    if (!bookmark) throw new NotFoundException('북마크를 찾을 수 없습니다.');
    if (bookmark.user.id !== userId) throw new ForbiddenException('본인의 북마크만 삭제할 수 있습니다.');

    await this.bookmarkRepository.delete(bookmarkId);
  }
}
