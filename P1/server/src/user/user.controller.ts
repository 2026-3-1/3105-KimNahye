import { JwtAccessGuard } from '@auth/guards/jwt-access.guard';
import { GetUser } from '@common/decorators/get-user.decorator';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { ApiResponseDto } from '@common/dto/api-response.dto';
import { UserDetailResponse } from './dto/user-detail-response.dto';
import { GetMe, UpdateMe } from './decorators/user-swagger.decorator';
import { UpdateUserRequestDto } from './dto/update-user-request.dto';
import { UpdateUserResponseDto } from './dto/update-user-response.dto';

@Controller('user')
@UseGuards(JwtAccessGuard)
@ApiBearerAuth('access-token')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @GetMe()
  async getMe(
    @GetUser('id') userId: string,
  ): Promise<ApiResponseDto<UserDetailResponse>> {
    const data = await this.userService.getMe(userId);

    return ApiResponseDto.success(
      data,
      '내 정보 조회에 성공하였습니다.',
      HttpStatus.OK,
    );
  }

  @Patch('me')
  @UpdateMe()
  async updateMe(
    @GetUser('id') userId: string,
    @Body() dto: UpdateUserRequestDto,
  ): Promise<ApiResponseDto<UpdateUserResponseDto>> {
    const data = await this.userService.updateMe(userId, dto);

    return ApiResponseDto.success(data, '수정 성공', HttpStatus.OK);
  }
}
