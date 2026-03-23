import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
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
    ApiQuery({
      name: 'requiredTools',
      type: String,
      isArray: true,
      required: false,
    }),
    ApiQuery({ name: 'duration', type: Number, required: false }),
    ApiQuery({ name: 'page', type: Number, required: false }),
    ApiQuery({ name: 'limit', type: Number, required: false }),
    ApiOkResponse({ description: '강의 목록이 조회되었습니다.' }),
  );

export const ApiGetCourseDetail = () =>
  applyDecorators(
    ApiOperation({
      summary: '강의 상세 조회',
      description: 'id 입력 후 강의 상세 조회',
    }),
    ApiParam({ name: 'id', type: String, required: true }),
  );

export const ApiGetCourseListByUser = () =>
  applyDecorators(
    ApiOperation({
      summary: '내 강의 목록 조회',
      description: '유저 아이디 입력 후 강의 목록 조회',
    }),
  );

export const ApiRegistration = () =>
  applyDecorators(
    ApiOperation({
      summary: '강의 수강 신청',
      description: 'id 입력 후 강의 수강 신청',
    }),
    ApiParam({ name: 'id', type: String, required: true }),
  );
