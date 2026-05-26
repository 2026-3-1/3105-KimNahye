import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { ReviewRepository } from './review.repository';
import { Review } from './entities/review.entity';
import { REVIEW_REPOSITORY } from './interfaces/review-repository.interface';
import { AuthModule } from '@auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { CourseModule } from 'src/courses/course.module';
import { VideoWatchLog } from 'src/videos/entities/video-watch-log.entity';
import { WatchLogRepository } from 'src/videos/watch-log.repository';
import { WATCH_LOG_REPOSITORY } from 'src/videos/interfaces/watch-log-repository.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, VideoWatchLog]),
    PassportModule,
    AuthModule,
    UserModule,
    CourseModule,
  ],
  controllers: [ReviewController],
  providers: [
    ReviewService,
    {
      provide: REVIEW_REPOSITORY,
      useClass: ReviewRepository,
    },
    {
      provide: WATCH_LOG_REPOSITORY,
      useClass: WatchLogRepository,
    },
  ],
})
export class ReviewModule {}
