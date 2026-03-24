import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './entities/video.entity';
import { User } from 'src/user/entities/user.entity';
import { Course } from 'src/courses/entities/course.entity';
import { VideoRepository } from './video.repository';
import { VIDEO_REPOSITORY } from './interfaces/video-repository.interface';
import { AuthModule } from '@auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/user/user.module';
import { CourseModule } from 'src/courses/course.module';
import { EnrollmentsModule } from 'src/enrollments/enrollment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Video, User, Course]),
    UserModule,
    CourseModule,
    AuthModule,
    PassportModule,
    EnrollmentsModule,
  ],
  controllers: [VideoController],
  providers: [
    VideoService,
    {
      provide: VIDEO_REPOSITORY,
      useClass: VideoRepository,
    },
  ],
})
export class VideosModule {}
