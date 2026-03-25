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
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums/user-role.enum';
import { CreateVideoDto } from './dto/create-video.dto';
import { CreateVideoReponseDto } from './dto/create-video-response.dto';

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
}
