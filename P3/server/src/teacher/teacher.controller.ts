import { JwtAccessGuard } from '@auth/guards/jwt-access.guard';
import { GetUser } from '@common/decorators/get-user.decorator';
import { ApiResponseDto } from '@common/dto/api-response.dto';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiCreateCourse } from 'src/courses/decorators/course-swagger.decorator';
import { CreateCourseRequest } from 'src/courses/dto/create-course-request.dto';
import { UpdateCourseRequest } from 'src/courses/dto/update-course-request.dto';
import { CreateCourseResponse } from 'src/courses/dto/create-course-response.dto';
import { TeacherService } from './teacher.service';
import { CourseListResponse } from 'src/courses/dto/course-list-response.dto';
import { ApiGetCourseListByTeacher } from './decorators/teacher-swagger.decorator';

@Controller('teacher')
@ApiBearerAuth('access-token')
@UseGuards(JwtAccessGuard)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateCourse()
  async createCourse(
    @Body() dto: CreateCourseRequest,
    @GetUser('id') userId: string,
  ): Promise<ApiResponseDto<CreateCourseResponse>> {
    const result = await this.teacherService.create(dto, userId);

    return ApiResponseDto.success(
      result,
      '강의 생성에 성공하였습니다.',
      HttpStatus.CREATED,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiGetCourseListByTeacher()
  async getCourseListByTeacher(
    @GetUser('id') userId: string,
  ): Promise<ApiResponseDto<CourseListResponse[] | null>> {
    const result = await this.teacherService.getCourseListByTeacher(userId);

    return ApiResponseDto.success(
      result,
      '선생님 강의 목록 조회에 성공하였습니다.',
      HttpStatus.OK,
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateCourse(
    @Param('id') courseId: string,
    @Body() dto: UpdateCourseRequest,
    @GetUser('id') userId: string,
  ): Promise<ApiResponseDto<null>> {
    await this.teacherService.updateCourse(courseId, dto, userId);
    return ApiResponseDto.success(null, '강의 수정에 성공하였습니다.', HttpStatus.OK);
  }
}
