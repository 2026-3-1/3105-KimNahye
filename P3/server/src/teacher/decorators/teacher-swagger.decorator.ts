import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiGetCourseListByTeacher = () =>
  applyDecorators(
    ApiOperation({
      summary: '선생님 강의 상세 조회',
      description: '로그인 후 상세 조회',
    }),
  );
