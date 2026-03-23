import { Injectable } from '@nestjs/common';
import { IVideosRepository } from './interfaces/video-repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Videos } from './entities/videos.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VideosRepository implements IVideosRepository {
  constructor(
    @InjectRepository(Videos)
    private readonly repo: Repository<Videos>,
  ) {}

  async findById(id: string): Promise<Videos | null> {
    const result = await this.repo.findOne({
      where: { id },
    });

    return result;
  }
}
