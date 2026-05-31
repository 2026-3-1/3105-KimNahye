import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { Payment } from './entities/payment.entity';
import { EnrollmentsModule } from 'src/enrollments/enrollment.module';
import { UserModule } from 'src/user/user.module';
import { CourseModule } from 'src/courses/course.module';
import { MailModule } from 'src/mail/mail.module';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    EnrollmentsModule,
    UserModule,
    CourseModule,
    MailModule,
    AuthModule,
    PassportModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
