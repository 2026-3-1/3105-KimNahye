import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Videos } from './entities/videos.entity';
import { User } from 'src/user/entities/user.entity';
import { Courses } from 'src/courses/entities/courses.entity';
import { VideosRepository } from './videos.repository';
import { VIDEOS_REPOSITORY } from './interfaces/video-repository.interface';
import { AuthModule } from '@auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([Videos, User, Courses]),
    AuthModule,
    PassportModule,
  ],
  controllers: [VideosController],
  providers: [
    VideosService,
    {
      provide: VIDEOS_REPOSITORY,
      useClass: VideosRepository,
    },
  ],
})
export class VideosModule {}
