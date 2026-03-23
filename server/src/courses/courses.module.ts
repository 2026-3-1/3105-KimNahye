import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Courses } from './entities/courses.entity';
import { COURSES_REPOSITORY } from './interfaces/courses-repository.interface';
import { CoursesRepository } from './courses.repository';
import { UsersModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '@auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Courses]),
    UsersModule,
    PassportModule,
    AuthModule,
  ],
  providers: [
    CoursesService,
    {
      provide: COURSES_REPOSITORY,
      useClass: CoursesRepository,
    },
  ],
  controllers: [CoursesController],
})
export class CoursesModule {}
