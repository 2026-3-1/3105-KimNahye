import { Injectable } from '@nestjs/common';
import { IVideoRepository } from './interfaces/video-repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Video } from './entities/video.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VideoRepository implements IVideoRepository {
  constructor(
    @InjectRepository(Video)
    private readonly repo: Repository<Video>,
  ) {}

  async findById(id: string): Promise<Video | null> {
    const result = await this.repo.findOne({
      where: { id },
    });

    return result;
  }
}
