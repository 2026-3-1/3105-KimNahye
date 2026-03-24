import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { JwtAccessGuard } from '@auth/guards/jwt-access.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetUser } from '@common/decorators/get-user.decorator';
import { Enrollment } from './entities/enrollment.entity';
import { ApiResponseDto } from '@common/dto/api-response.dto';
import { ApiEnroll } from './decorators/enrollment-swagger.decorator';

@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post('/courses/:courseId/enroll')
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiEnroll()
  async enroll(
    @Param('courseId') courseId: string,
    @GetUser('id') userId: string,
  ): Promise<ApiResponseDto<Enrollment>> {
    const data = await this.enrollmentService.enroll(userId, courseId);
    return ApiResponseDto.success(
      data,
      '수강 신청이 완료되었습니다.',
      HttpStatus.CREATED,
    );
  }
}
