import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Courses } from './entities/courses.entity';
import { Repository } from 'typeorm';
import { ICoursesRepository } from './interfaces/courses-repository.interface';
import { Category } from './entities/enums/category.enum';
import { Difficulty } from './entities/enums/difficulty.enum';

@Injectable()
export class CoursesRepository implements ICoursesRepository {
  constructor(
    @InjectRepository(Courses)
    private readonly repo: Repository<Courses>,
  ) {}

  async findByQuery(
    category?: Category,
    difficulty?: Difficulty,
    tools?: string,
    max_duration?: number,
    page?: number,
    limit?: number,
  ): Promise<Courses[] | null> {
    const qb = this.repo
      .createQueryBuilder('course')
      .loadRelationCountAndMap('course.videoCount', 'course.videos');

    if (category) qb.andWhere('course.category = :category', { category });
    if (difficulty)
      qb.andWhere('course.difficulty = :difficulty', { difficulty });
    if (tools) qb.andWhere('course.tools = :tools', { tools });
    if (max_duration)
      qb.andWhere('course.max_duration <= :max_duration', { max_duration });

    const currentPage = page ?? 1;
    const currentLimit = limit ?? 10;
    qb.skip((currentPage - 1) * currentLimit).take(currentLimit);

    return qb.getMany();
  }
}
