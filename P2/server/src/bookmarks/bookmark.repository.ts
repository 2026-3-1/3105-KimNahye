import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookmark } from './entities/bookmark.entity';
import { IBookmarkRepository } from './interfaces/bookmark-repository.interface';
import { User } from 'src/user/entities/user.entity';
import { Video } from 'src/videos/entities/video.entity';

@Injectable()
export class BookmarkRepository implements IBookmarkRepository {
  constructor(
    @InjectRepository(Bookmark)
    private readonly repo: Repository<Bookmark>,
  ) {}

  async findByUserAndVideo(user: User, video: Video): Promise<Bookmark[]> {
    return this.repo.find({
      where: { user: { id: user.id }, video: { id: video.id } },
      order: { positionSec: 'ASC' },
    });
  }

  async findById(id: string): Promise<Bookmark | null> {
    return this.repo.findOne({ where: { id }, relations: ['user', 'video'] });
  }

  async create(user: User, video: Video, positionSec: number, note?: string): Promise<Bookmark> {
    const bookmark = this.repo.create({ user, video, positionSec, note });
    return this.repo.save(bookmark);
  }

  async updateNote(id: string, note: string): Promise<Bookmark> {
    await this.repo.update(id, { note });
    return this.repo.findOne({ where: { id } }) as Promise<Bookmark>;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
