import { Module } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '@auth/auth.module';
import { ENROLLMENT_REPOSITORY } from './interfaces/enrollment-repository.interface';
import { EnrollmentRepository } from './enrollment.repository';
import { CourseModule } from 'src/courses/course.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enrollment]),
    UserModule,
    PassportModule,
    AuthModule,
    CourseModule,
  ],
  controllers: [EnrollmentController],
  providers: [
    EnrollmentService,
    {
      provide: ENROLLMENT_REPOSITORY,
      useClass: EnrollmentRepository,
    },
  ],
  exports: [EnrollmentService],
})
export class EnrollmentsModule {}
