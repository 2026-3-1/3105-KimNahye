import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { CourseService } from './course.service';
import {
  ApiGetCourseDetail,
  ApiGetCourseList,
  ApiGetCourseListByUser,
} from './decorators/course-swagger.decorator';
import { CourseQueryDto } from './dto/course-query.dto';
import { ApiResponseDto } from '@common/dto/api-response.dto';
import { CourseListResponse } from './dto/course-list-response.dto';
import { CourseDetailResponse } from './dto/course-detail.response.dto';
import { GetUser } from '@common/decorators/get-user.decorator';
import { JwtAccessGuard } from '@auth/guards/jwt-access.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('courses')
@ApiBearerAuth('access-token')
@UseGuards(JwtAccessGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('list')
  @HttpCode(HttpStatus.OK)
  @ApiGetCourseList()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('courses_list')
  @CacheTTL(300_000)
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
  @HttpCode(HttpStatus.OK)
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
