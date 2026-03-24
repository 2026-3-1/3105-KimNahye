import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

export const ApiEnroll = () =>
  applyDecorators(
    ApiOperation({
      summary: '강의 수강 신청',
      description: 'id 입력 후 강의 수강 신청',
    }),
    ApiParam({ name: 'id', type: String, required: true }),
  );
