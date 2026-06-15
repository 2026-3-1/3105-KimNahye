import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  findAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'nickname', 'role', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateUserRole(id: string, role: UserRole): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('존재하지 않는 유저입니다.');
    user.role = role;
    return this.userRepository.save(user);
  }

  findAllCourses(): Promise<Course[]> {
    return this.courseRepository.find({
      relations: ['teacher'],
      order: { createdAt: 'DESC' },
    });
  }

  async deleteCourse(id: string): Promise<void> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) throw new NotFoundException('존재하지 않는 강좌입니다.');
    await this.courseRepository.remove(course);
  }

  findAllPayments(): Promise<Payment[]> {
    return this.paymentRepository.find({ order: { paidAt: 'DESC' } });
  }
}
