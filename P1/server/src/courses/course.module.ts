import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { COURSE_REPOSITORY } from './interfaces/courses-repository.interface';
import { CourseRepository } from './course.repository';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '@auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
    UserModule,
    PassportModule,
    AuthModule,
  ],
  providers: [
    CourseService,
    {
      provide: COURSE_REPOSITORY,
      useClass: CourseRepository,
    },
  ],
  controllers: [CourseController],
  exports: [CourseService],
})
export class CourseModule {}
