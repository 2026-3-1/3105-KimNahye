import { InjectRepository } from '@nestjs/typeorm';
import { IEnrollmentRepository } from './interfaces/enrollment-repository.interface';
import { Injectable } from '@nestjs/common';
import { Enrollment } from './entities/enrollment.entity';

import { Repository } from 'typeorm';
import { Course } from 'src/courses/entities/course.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class EnrollmentRepository implements IEnrollmentRepository {
  constructor(
    @InjectRepository(Enrollment)
    private readonly repo: Repository<Enrollment>,
  ) {}

  async findByUserAndCourse(
    user: User,
    course: Course,
  ): Promise<Enrollment | null> {
    const result = await this.repo.findOne({
      where: { user: { id: user.id }, course: { id: course.id } },
    });

    return result;
  }

  async create(user: User, course: Course): Promise<Enrollment | null> {
    const enrollment = this.repo.create({ user, course });

    return await this.repo.save(enrollment);
  }
}
