import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Course, Payment])],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
