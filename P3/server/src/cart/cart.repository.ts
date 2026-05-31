import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { ICartRepository } from './interfaces/cart-repository.interface';
import { User } from 'src/user/entities/user.entity';
import { Course } from 'src/courses/entities/course.entity';

@Injectable()
export class CartRepository implements ICartRepository {
  constructor(
    @InjectRepository(CartItem)
    private readonly repo: Repository<CartItem>,
  ) {}

  async findAllByUser(user: User): Promise<CartItem[]> {
    return this.repo.find({
      where: { user: { id: user.id } },
      relations: { course: { teacher: true, videos: true } },
      order: { addedAt: 'DESC' },
    });
  }

  async findByUserAndCourse(user: User, course: Course): Promise<CartItem | null> {
    return this.repo.findOne({
      where: { user: { id: user.id }, course: { id: course.id } },
    });
  }

  async add(user: User, course: Course): Promise<CartItem> {
    const item = this.repo.create({ user, course });
    return this.repo.save(item);
  }

  async removeByUserAndCourse(user: User, course: Course): Promise<void> {
    await this.repo.delete({ user: { id: user.id }, course: { id: course.id } });
  }

  async clearByUser(user: User): Promise<void> {
    await this.repo.delete({ user: { id: user.id } });
  }
}
