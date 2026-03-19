import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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

@ApiTags('인증 (Auth)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─────────────────────────────────────────────
  // POST /auth/register
  // ─────────────────────────────────────────────
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '회원가입',
    description: '이메일, 비밀번호, 닉네임, 역할을 입력하여 회원가입합니다.',
  })
  @ApiCreatedResponse({
    description: '회원가입 성공',
    schema: {
      example: {
        statusCode: 201,
        message: '회원가입 성공',
        data: {
          id: '...',
          email: 'user@example.com',
          nickname: '닉네임',
          role: 'teacher',
        },
      },
    },
  })
  @ApiConflictResponse({ description: '이미 사용 중인 이메일' })
  async register(
    @Body() dto: RegisterRequestDto,
  ): Promise<ApiResponseDto<RegisterResponseDto>> {
    const data = await this.authService.register(dto);
    return ApiResponseDto.success(data, '회원가입 성공', HttpStatus.CREATED);
  }

  // ─────────────────────────────────────────────
  // POST /auth/login
  // ─────────────────────────────────────────────
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '로그인',
    description: '이메일과 비밀번호로 로그인하여 JWT 토큰을 발급받습니다.',
  })
  @ApiOkResponse({
    description: '로그인 성공',
    schema: {
      example: {
        statusCode: 200,
        message: '로그인 성공',
        data: {
          accessToken: '...',
          refreshToken: '...',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: '이메일 또는 비밀번호 불일치' })
  async login(
    @Body() dto: LoginRequestDto,
  ): Promise<ApiResponseDto<TokenResponseDto>> {
    const data = await this.authService.login(dto);
    return ApiResponseDto.success(data, '로그인 성공');
  }

  // ─────────────────────────────────────────────
  // POST /auth/refresh
  // ─────────────────────────────────────────────
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiBearerAuth('refresh-token')
  @ApiOperation({
    summary: '토큰 재발급',
    description:
      '리프레시 토큰을 사용하여 새로운 액세스/리프레시 토큰을 발급받습니다.',
  })
  @ApiOkResponse({
    description: '토큰 재발급 성공',
    schema: {
      example: {
        statusCode: 200,
        message: '토큰 재발급 성공',
        data: {
          accessToken: '...',
          refreshToken: '...',
        },
      },
    },
  })
  @ApiUnauthorizedException()
  async refresh(
    @GetUser() user: User,
    @Req() req: Request & { headers: { authorization?: string } },
  ): Promise<ApiResponseDto<TokenResponseDto>> {
    const oldRefreshToken = req.headers.authorization?.split(' ')[1] ?? '';
    const data = await this.authService.refreshTokens(user, oldRefreshToken);
    return ApiResponseDto.success(data, '토큰 재발급 성공');
  }

  // ─────────────────────────────────────────────
  // POST /auth/logout
  // ─────────────────────────────────────────────
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '로그아웃',
    description: '현재 사용자를 로그아웃하고 리프레시 토큰을 무효화합니다.',
  })
  @ApiOkResponse({
    description: '로그아웃 성공',
    schema: {
      example: {
        statusCode: 200,
        message: '로그아웃 성공',
        data: null,
      },
    },
  })
  async logout(@GetUser('id') userId: string): Promise<ApiResponseDto<null>> {
    await this.authService.logout(userId);
    return ApiResponseDto.success(null, '로그아웃 성공');
  }
}

// Swagger 데코레이터 단축 헬퍼 (중복 제거용)
function ApiUnauthorizedException() {
  return ApiUnauthorizedResponse({
    description: '유효하지 않거나 만료된 토큰',
  });
}
