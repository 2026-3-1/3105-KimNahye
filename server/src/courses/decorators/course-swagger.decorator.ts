import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Category } from '../entities/enums/category.enum';
import { Difficulty } from '../entities/enums/difficulty.enum';

export const ApiGetCourseList = () =>
  applyDecorators(
    ApiOperation({
      summary: '강의 목록 조회',
      description: '카테고리, 난이도, 도구 등 다중 필터로 강의 목록 조회',
    }),
    ApiQuery({ name: 'category', enum: Category, required: false }),
    ApiQuery({ name: 'difficulty', enum: Difficulty, required: false }),
    ApiQuery({ name: 'tools', type: String, required: false }),
    ApiQuery({ name: 'max_duration', type: Number, required: false }),
    ApiQuery({ name: 'page', type: Number, required: false }),
    ApiQuery({ name: 'limit', type: Number, required: false }),
    ApiOkResponse({ description: '강의 목록이 조회되었습니다.' }),
  );
