import { Injectable } from '@nestjs/common';
import { IVideoRepository } from './interfaces/video-repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Video } from './entities/video.entity';
import { Repository } from 'typeorm';
import { Course } from 'src/courses/entities/course.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class VideoRepository implements IVideoRepository {
  constructor(
    @InjectRepository(Video)
    private readonly repo: Repository<Video>,
  ) {}
  async create(
    youtubeVideoId: string,
    title: string,
    duration: number,
    teacher: User,
    course: Course,
  ) {
    const video = this.repo.create({
      youtubeVideoId: youtubeVideoId,
      title: title,
      duration: duration,
      teacher,
      course,
    });

    return this.repo.save(video);
  }

  async findById(id: string): Promise<Video | null> {
    const result = await this.repo.findOne({
      where: { id },
    });

    return result;
  }
}
