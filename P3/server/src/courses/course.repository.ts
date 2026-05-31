import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Repository } from 'typeorm';
import { ICourseRepository } from './interfaces/courses-repository.interface';
import { Category } from './entities/enums/category.enum';
import { Difficulty } from './entities/enums/difficulty.enum';
import { Video } from 'src/videos/entities/video.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CourseRepository implements ICourseRepository {
  constructor(
    @InjectRepository(Course)
    private readonly repo: Repository<Course>,
  ) {}
  async findByTeacher(teacher: User): Promise<Course[] | null> {
    const result = await this.repo.find({
      where: { teacher: { id: teacher.id } },
      relations: { teacher: true, videos: true },
    });

    return result.length > 0 ? result : null;
  }

  async create(
    teacher: User,
    category: Category,
    difficulty: Difficulty,
    requiredTools: string[],
    price: number,
  ): Promise<Course | null> {
    const course = this.repo.create({
      teacher,
      category,
      difficulty,
      requiredTools,
      price,
    });

    return await this.repo.save(course);
  }

  async findByVideo(video: Video): Promise<Course | null> {
    const result = await this.repo.findOne({
      where: {
        videos: { id: video.id },
      },
      relations: {
        videos: true,
        teacher: true,
      },
    });

    return result;
  }

  async findByQuery(
    category?: Category,
    difficulty?: Difficulty,
    requiredTools?: string[],
    duration?: number,
    page?: number,
    limit?: number,
  ): Promise<Course[] | null> {
    const qb = this.repo
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.teacher', 'teacher')
      .leftJoinAndSelect('course.videos', 'videos');

    if (category) qb.andWhere('course.category = :category', { category });
    if (difficulty)
      qb.andWhere('course.difficulty = :difficulty', { difficulty });
    if (requiredTools)
      qb.andWhere('course.requiredTools @> CAST(:requiredTools AS jsonb)', {
        requiredTools: JSON.stringify(requiredTools),
      });
    if (duration) {
      qb.andWhere(
        `(SELECT SUM(v.duration) FROM videos v WHERE v."courseId" = course.id) <= :duration`,
        { duration },
      );
    }
    const currentPage = page ?? 1;
    const currentLimit = limit ?? 10;
    qb.skip((currentPage - 1) * currentLimit).take(currentLimit);

    return qb.getMany();
  }

  async findById(id: string): Promise<Course | null> {
    const result = await this.repo.findOne({
      where: { id },
      relations: {
        videos: true,
        teacher: true,
      },
    });

    return result;
  }

  async update(
    id: string,
    category?: Category,
    difficulty?: Difficulty,
    requiredTools?: string[],
    price?: number,
  ): Promise<void> {
    const patch: Partial<Course> = {};
    if (category !== undefined) patch.category = category;
    if (difficulty !== undefined) patch.difficulty = difficulty;
    if (requiredTools !== undefined) patch.requiredTools = requiredTools;
    if (price !== undefined) patch.price = price;
    await this.repo.update(id, patch);
  }
}
