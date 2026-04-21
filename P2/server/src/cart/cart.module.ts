import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartRepository } from './cart.repository';
import { CartItem } from './entities/cart-item.entity';
import { CART_REPOSITORY } from './interfaces/cart-repository.interface';
import { AuthModule } from '@auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { CourseModule } from 'src/courses/course.module';
import { EnrollmentsModule } from 'src/enrollments/enrollment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartItem]),
    PassportModule,
    AuthModule,
    UserModule,
    CourseModule,
    EnrollmentsModule,
  ],
  controllers: [CartController],
  providers: [
    CartService,
    {
      provide: CART_REPOSITORY,
      useClass: CartRepository,
    },
  ],
  exports: [CartService],
})
export class CartModule {}
