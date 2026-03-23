import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiGetVideoDetail = () => {
  return applyDecorators(
    ApiOperation({
      summary: '영상 상세 조회',
      description: '영상 상세 정보 조회(유튜브 영상 포함)',
    }),
  );
};
