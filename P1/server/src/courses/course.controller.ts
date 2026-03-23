import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CourseService } from './course.service';
import {
  ApiGetCourseDetail,
  ApiGetCourseList,
  ApiGetCourseListByUser,
  ApiRegistration,
} from './decorators/course-swagger.decorator';
import { CourseQueryDto } from './dto/course-query.dto';
import { ApiResponseDto } from '@common/dto/api-response.dto';
import { CourseListResponse } from './dto/course-list-response.dto';
import { CourseDetailResponse } from './dto/course-detail.response.dto';
import { GetUser } from '@common/decorators/get-user.decorator';
import { JwtAccessGuard } from '@auth/guards/jwt-access.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('list')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.OK)
  @ApiGetCourseList()
  async getCourseList(
    @Query() dto: CourseQueryDto,
  ): Promise<ApiResponseDto<CourseListResponse[] | null>> {
    const data = await this.courseService.getCourseList(dto);

    return ApiResponseDto.success(
      data,
      '강의 목록 조회에 성공하였습니다.',
      HttpStatus.OK,
    );
  }

  @Get('/my')
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessGuard)
  @ApiGetCourseListByUser()
  async getCourseListByUser(
    @GetUser('id') userId: string,
  ): Promise<ApiResponseDto<CourseListResponse[] | null>> {
    const data = await this.courseService.getCourseListByUser(userId);
    return ApiResponseDto.success(
      data,
      '내 강의 목록 조회에 성공하였습니다.',
      HttpStatus.OK,
    );
  }

  @Get('/:id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.OK)
  @ApiGetCourseDetail()
  async getCourseDetail(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<CourseDetailResponse>> {
    const data = await this.courseService.getCourseDetail(id);
    return ApiResponseDto.success(
      data,
      '강의 상세 조회에 성공하였습니다.',
      HttpStatus.OK,
    );
  }
}
