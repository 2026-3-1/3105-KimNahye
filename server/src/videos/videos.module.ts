import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Videos } from './entities/videos.entity';
import { User } from 'src/user/entities/user.entity';
import { Courses } from 'src/courses/entities/courses.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Videos, User, Courses])],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}
