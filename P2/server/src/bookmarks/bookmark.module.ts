import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { BookmarkController } from './bookmark.controller';
import { BookmarkService } from './bookmark.service';
import { BookmarkRepository } from './bookmark.repository';
import { Bookmark } from './entities/bookmark.entity';
import { BOOKMARK_REPOSITORY } from './interfaces/bookmark-repository.interface';
import { AuthModule } from '@auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { Video } from 'src/videos/entities/video.entity';
import { VideoRepository } from 'src/videos/video.repository';
import { VIDEO_REPOSITORY } from 'src/videos/interfaces/video-repository.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bookmark, Video]),
    PassportModule,
    AuthModule,
    UserModule,
  ],
  controllers: [BookmarkController],
  providers: [
    BookmarkService,
    {
      provide: BOOKMARK_REPOSITORY,
      useClass: BookmarkRepository,
    },
    {
      provide: VIDEO_REPOSITORY,
      useClass: VideoRepository,
    },
  ],
})
export class BookmarkModule {}
