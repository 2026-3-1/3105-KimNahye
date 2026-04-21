import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../../user/entities/user.entity';
import { TokenResponseDto } from '../dto/token-response.dto';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(user: User): Promise<TokenResponseDto> {
    const basePayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessPayload: JwtPayload = { ...basePayload, type: 'access' };
    const refreshPayload: JwtPayload = { ...basePayload, type: 'refresh' };

    const accessOptions: JwtSignOptions = {
      secret: this.configService.getOrThrow<string>('JWT_SECRET_KEY'),
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN', '1h'), // 1시간(프로덕션 5분)
    };

    const refreshOptions: JwtSignOptions = {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET_KEY'),
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN', '7d'), // 7일 (프로덕션 1시간)
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, accessOptions),
      this.jwtService.signAsync(refreshPayload, refreshOptions),
    ]);

    return { accessToken, refreshToken };
  }
}
