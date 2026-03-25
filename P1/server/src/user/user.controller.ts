import { JwtAccessGuard } from '@auth/guards/jwt-access.guard';
import { GetUser } from '@common/decorators/get-user.decorator';
import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { ApiResponseDto } from '@common/dto/api-response.dto';
import { UserDetailResponse } from './dto/user-detail-response.dto';
import { GetMe } from './decorators/user-swagger.decorator';

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
}
