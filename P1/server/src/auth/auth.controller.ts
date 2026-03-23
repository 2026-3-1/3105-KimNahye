import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import {
  LoginRequestDto,
  RegisterRequestDto,
} from './dto/register-request.dto';
import {
  RegisterResponseDto,
  TokenResponseDto,
} from './dto/token-response.dto';
import { User } from 'src/user/entities/user.entity';
import {
  ApiRegister,
  ApiLogin,
  ApiRefresh,
  ApiLogout,
} from './decorators/auth-swagger.decorator';

@ApiTags('인증 (Auth)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiRegister()
  async register(
    @Body() dto: RegisterRequestDto,
  ): Promise<ApiResponseDto<RegisterResponseDto>> {
    const data = await this.authService.register(dto);
    return ApiResponseDto.success(data, '회원가입 성공', HttpStatus.CREATED);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiLogin()
  async login(
    @Body() dto: LoginRequestDto,
  ): Promise<ApiResponseDto<TokenResponseDto>> {
    const data = await this.authService.login(dto);
    return ApiResponseDto.success(data, '로그인 성공', HttpStatus.OK);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiRefresh()
  async refresh(
    @GetUser() user: User,
    @Req() req: Request & { headers: { authorization?: string } },
  ): Promise<ApiResponseDto<TokenResponseDto>> {
    const oldRefreshToken = req.headers.authorization?.split(' ')[1] ?? '';
    const data = await this.authService.refreshTokens(user, oldRefreshToken);
    return ApiResponseDto.success(data, '토큰 재발급 성공', HttpStatus.OK);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessGuard)
  @ApiLogout()
  async logout(@GetUser('id') userId: string): Promise<ApiResponseDto<null>> {
    await this.authService.logout(userId);
    return ApiResponseDto.success(null, '로그아웃 성공', HttpStatus.OK);
  }
}
