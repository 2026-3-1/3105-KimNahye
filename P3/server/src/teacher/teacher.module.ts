import { AuthModule } from '@auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/user/user.module';
import { VideosModule } from 'src/videos/video.module';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { Module } from '@nestjs/common';
import { CourseModule } from 'src/courses/course.module';

@Module({
  imports: [UserModule, PassportModule, AuthModule, CourseModule, VideosModule],
  providers: [TeacherService],
  controllers: [TeacherController],
  exports: [TeacherService],
})
export class TeacherModule {}
