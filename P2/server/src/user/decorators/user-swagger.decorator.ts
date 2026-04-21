import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const GetMe = () =>
  applyDecorators(
    ApiOperation({
      summary: '내 정보 조회',
      description: '내 정보 상세 보기',
    }),
  );

export const UpdateMe = () =>
  applyDecorators(
    ApiOperation({
      summary: '내 정보 수정',
      description: '이메일, 닉네임 수정',
    }),
  );
