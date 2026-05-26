import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { ApiResponseDto } from '@common/dto/api-response.dto';
import { GetVideoDetailResponse } from './dto/get-video-detail.dto';
import { ApiGetVideoDetail } from './decorators/video-swagger.decorator';
import { JwtAccessGuard } from '@auth/guards/jwt-access.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GetUser } from '@common/decorators/get-user.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums/user-role.enum';
import { CreateVideoDto } from './dto/create-video.dto';
import { CreateVideoReponseDto } from './dto/create-video-response.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { ProgressResponseDto } from './dto/progress-response.dto';

@Controller('videos')
@UseGuards(JwtAccessGuard)
@ApiBearerAuth('access-token')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get('/:id')
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

  @Post()
  @Roles(UserRole.TEACHER)
  async create(
    @Body() createVideoDto: CreateVideoDto,
    @GetUser('id') userId: string,
  ): Promise<ApiResponseDto<CreateVideoReponseDto>> {
    const result = await this.videoService.create(createVideoDto, userId);

    return ApiResponseDto.success(
      result,
      '영상 등록에 성공하였습니다.',
      HttpStatus.CREATED,
    );
  }

  @Patch('/:id/progress')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '시청 위치 업데이트 (30초마다 호출)' })
  async updateProgress(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateProgressDto,
  ): Promise<ApiResponseDto<ProgressResponseDto>> {
    const data = await this.videoService.updateProgress(id, userId, dto);
    return ApiResponseDto.success(data, '시청 위치가 저장되었습니다.', HttpStatus.OK);
  }

  @Get('/:id/progress')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '마지막 시청 위치 조회 (이어보기)' })
  async getProgress(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ): Promise<ApiResponseDto<ProgressResponseDto>> {
    const data = await this.videoService.getProgress(id, userId);
    return ApiResponseDto.success(data, '시청 위치 조회에 성공하였습니다.', HttpStatus.OK);
  }
}
