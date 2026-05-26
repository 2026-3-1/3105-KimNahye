import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CART_REPOSITORY, ICartRepository } from './interfaces/cart-repository.interface';
import { UserService } from 'src/user/user.service';
import { CourseService } from 'src/courses/course.service';
import { EnrollmentService } from 'src/enrollments/enrollment.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CartResponse } from './dto/cart-response.dto';

@Injectable()
export class CartService {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    private readonly userService: UserService,
    private readonly courseService: CourseService,
    private readonly enrollmentService: EnrollmentService,
  ) {}

  async getCart(userId: string): Promise<CartResponse> {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('존재하지 않는 사용자입니다.');

    const items = await this.cartRepository.findAllByUser(user);

    return {
      items: items.map((item) => ({
        id: item.id,
        courseId: item.course.id,
        category: item.course.category,
        difficulty: item.course.difficulty,
        teacher: { id: item.course.teacher.id, name: item.course.teacher.nickname },
        videoCount: item.course.computedVideoCount,
        price: item.course.price ?? 0,
        addedAt: item.addedAt,
      })),
      totalCount: items.length,
    };
  }

  async addToCart(userId: string, dto: AddToCartDto): Promise<void> {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('존재하지 않는 사용자입니다.');

    const course = await this.courseService.findById(dto.courseId);
    if (!course) throw new NotFoundException('존재하지 않는 강좌입니다.');

    const enrollment = await this.enrollmentService.findByUserAndCourse(user, course);
    if (enrollment) throw new BadRequestException('이미 수강 중인 강좌입니다.');

    const existing = await this.cartRepository.findByUserAndCourse(user, course);
    if (existing) throw new ConflictException('이미 장바구니에 담긴 강좌입니다.');

    await this.cartRepository.add(user, course);
  }

  async removeFromCart(userId: string, courseId: string): Promise<void> {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('존재하지 않는 사용자입니다.');

    const course = await this.courseService.findById(courseId);
    if (!course) throw new NotFoundException('존재하지 않는 강좌입니다.');

    await this.cartRepository.removeByUserAndCourse(user, course);
  }

  async clearCart(userId: string): Promise<void> {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('존재하지 않는 사용자입니다.');

    await this.cartRepository.clearByUser(user);
  }
}
