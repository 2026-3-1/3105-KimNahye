import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { ApiResponseDto } from '@common/dto/api-response.dto';
import { GetVideoDetailResponse } from './dto/get-video-detail.dto';
import { ApiGetVideoDetail } from './decorators/video-swagger.decorator';
import { JwtAccessGuard } from '@auth/guards/jwt-access.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get('/:id')
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth('access-token')
  @ApiGetVideoDetail()
  @HttpCode(HttpStatus.OK)
  async getVideoDetail(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<GetVideoDetailResponse>> {
    const data = await this.videosService.getVideoDetail(id);

    return ApiResponseDto.success(
      data,
      '영상 상세 조회에 성공하였습니다.',
      HttpStatus.OK,
    );
  }
}
