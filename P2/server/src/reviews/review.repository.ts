import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { IReviewRepository } from './interfaces/review-repository.interface';
import { User } from 'src/user/entities/user.entity';
import { Course } from 'src/courses/entities/course.entity';

@Injectable()
export class ReviewRepository implements IReviewRepository {
  constructor(
    @InjectRepository(Review)
    private readonly repo: Repository<Review>,
  ) {}

  async findByCourse(courseId: string): Promise<Review[]> {
    return this.repo.find({
      where: { course: { id: courseId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserAndCourse(user: User, course: Course): Promise<Review | null> {
    return this.repo.findOne({
      where: { user: { id: user.id }, course: { id: course.id } },
    });
  }

  async findById(id: string): Promise<Review | null> {
    return this.repo.findOne({ where: { id }, relations: ['user'] });
  }

  async create(user: User, course: Course, rating: number, content: string): Promise<Review> {
    const review = this.repo.create({ user, course, rating, content });
    return this.repo.save(review);
  }

  async update(id: string, rating: number, content: string): Promise<Review> {
    await this.repo.update(id, { rating, content });
    return this.repo.findOne({ where: { id }, relations: ['user'] }) as Promise<Review>;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
