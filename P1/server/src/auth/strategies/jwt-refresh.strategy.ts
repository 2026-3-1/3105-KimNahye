import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { User } from 'src/user/entities/user.entity';
import { RefreshTokenService } from '@auth/services/refresh-token.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly refreshTokenService: RefreshTokenService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    const options: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET_KEY'),
      passReqToCallback: true,
    };

    super(options);
  }

  async validate(
    req: Request & { headers: { authorization?: string } },
    payload: JwtPayload,
  ): Promise<User> {
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('리프레시 토큰이 아닙니다.');
    }

    const authHeader = req.headers['authorization'] ?? '';
    const refreshToken = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : '';

    if (!refreshToken) {
      throw new UnauthorizedException('리프레시 토큰이 없습니다.');
    }

    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }

    // 배열 비교 대신 RefreshTokenService에 검증 위임
    await this.refreshTokenService.validate(user.id, refreshToken);

    return user;
  }
}
