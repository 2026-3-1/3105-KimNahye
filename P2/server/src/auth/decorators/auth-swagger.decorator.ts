import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export const ApiRegister = () =>
  applyDecorators(
    ApiOperation({
      summary: '회원가입',
      description: '이메일, 비밀번호, 닉네임, 역할을 입력하여 회원가입합니다.',
    }),
    ApiCreatedResponse({ description: '회원가입 성공' }),
    ApiConflictResponse({ description: '이미 사용 중인 이메일' }),
  );

export const ApiLogin = () =>
  applyDecorators(
    ApiOperation({
      summary: '로그인',
      description: '이메일과 비밀번호로 로그인하여 JWT 토큰을 발급받습니다.',
    }),
    ApiOkResponse({ description: '로그인 성공' }),
    ApiUnauthorizedResponse({ description: '이메일 또는 비밀번호 불일치' }),
  );

export const ApiRefresh = () =>
  applyDecorators(
    ApiBearerAuth('refresh-token'),
    ApiOperation({
      summary: '토큰 재발급',
      description:
        '리프레시 토큰으로 새로운 액세스/리프레시 토큰을 발급받습니다.',
    }),
    ApiOkResponse({ description: '토큰 재발급 성공' }),
    ApiUnauthorizedResponse({ description: '유효하지 않거나 만료된 토큰' }),
  );

export const ApiLogout = () =>
  applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: '로그아웃',
      description: '현재 사용자를 로그아웃하고 리프레시 토큰을 무효화합니다.',
    }),
    ApiOkResponse({ description: '로그아웃 성공' }),
  );
