import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { UsersService } from 'src/user/user.service';
import {
  LoginRequestDto,
  RegisterRequestDto,
} from '../dto/register-request.dto';
import {
  RegisterResponseDto,
  TokenResponseDto,
} from '../dto/token-response.dto';
import { User } from 'src/user/entities/user.entity';
import { RefreshTokenService } from './refresh-token.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  // ─────────────────────────────────────────────
  // 회원가입
  // ─────────────────────────────────────────────
  async register(dto: RegisterRequestDto): Promise<RegisterResponseDto> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      nickname: dto.nickname,
      role: dto.role,
    });

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
    };
  }

  // ─────────────────────────────────────────────
  // 로그인
  // ─────────────────────────────────────────────
  async login(dto: LoginRequestDto): Promise<TokenResponseDto> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    const isPasswordValid = await user.validatePassword(dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    const tokens = await this.tokenService.generateTokens(user);
    await this.refreshTokenService.save(user.id, tokens.refreshToken);

    return tokens;
  }

  // ─────────────────────────────────────────────
  // 토큰 재발급
  // ─────────────────────────────────────────────
  async refreshTokens(
    user: User,
    oldRefreshToken: string,
  ): Promise<TokenResponseDto> {
    const storedToken = await this.refreshTokenService.validate(
      user.id,
      oldRefreshToken,
    );
    const tokens = await this.tokenService.generateTokens(user);
    await this.refreshTokenService.deleteOne(storedToken.id);
    await this.refreshTokenService.save(user.id, tokens.refreshToken);
    return tokens;
  }

  // ─────────────────────────────────────────────
  // 로그아웃
  // ─────────────────────────────────────────────
  async logout(userId: string): Promise<void> {
    await this.refreshTokenService.deleteAll(userId);
  }
}
