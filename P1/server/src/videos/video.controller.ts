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
import { VideoService } from './video.service';
import { ApiResponseDto } from '@common/dto/api-response.dto';
import { GetVideoDetailResponse } from './dto/get-video-detail.dto';
import { ApiGetVideoDetail } from './decorators/video-swagger.decorator';
import { JwtAccessGuard } from '@auth/guards/jwt-access.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetUser } from '@common/decorators/get-user.decorator';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get('/:id')
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth('access-token')
  @ApiGetVideoDetail()
  @HttpCode(HttpStatus.OK)
  async getVideoDetail(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ): Promise<ApiResponseDto<GetVideoDetailResponse>> {
    const data = await this.videoService.getVideoDetail(id, userId);

    return ApiResponseDto.success(
      data,
      '영상 상세 조회에 성공하였습니다.',
      HttpStatus.OK,
    );
  }
}
