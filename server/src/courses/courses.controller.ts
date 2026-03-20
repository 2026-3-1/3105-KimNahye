import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { ApiGetCourseList } from './decorators/course-swagger.decorator';
import { CourseQueryDto } from './dto/course-query.dto';
import { ApiResponseDto } from '@common/dto/api-response.dto';
import { CourseListResponse } from './dto/course-list-response.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get('list')
  @HttpCode(HttpStatus.OK)
  @ApiGetCourseList()
  async getCourseList(
    @Query() dto: CourseQueryDto,
  ): Promise<ApiResponseDto<CourseListResponse[] | null>> {
    const data = await this.coursesService.getCourseList(dto);
    return ApiResponseDto.success(
      data,
      '강의 목록 조회에 성공하였습니다.',
      HttpStatus.OK,
    );
  }
}
