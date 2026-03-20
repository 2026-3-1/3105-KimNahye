import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Courses } from './entities/courses.entity';
import { COURSES_REPOSITORY } from './interfaces/courses-repository.interface';
import { CoursesRepository } from './courses.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Courses])],
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
