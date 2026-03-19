import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IRefreshTokenRepository,
  REFRESH_TOKEN_REPOSITORY,
} from '../interfaces/refresh-token-repository.interface';
import { RefreshToken } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly configService: ConfigService,
  ) {}

  // ─────────────────────────────────────────────
  // 리프레시 토큰 저장
  // ─────────────────────────────────────────────
  async save(userId: string, plainToken: string): Promise<RefreshToken> {
    // 기존 유효 토큰 전부 무효화
    await this.refreshTokenRepository.revokeAllByUserId(userId);

    const expiresAt = this.calcExpiresAt(
      this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN', '7d'),
    );

    return this.refreshTokenRepository.save(userId, plainToken, expiresAt);
  }

  // ─────────────────────────────────────────────
  // 리프레시 토큰 검증
  // ─────────────────────────────────────────────
  async validate(userId: string, plainToken: string): Promise<RefreshToken> {
    const token = await this.refreshTokenRepository.findValidToken(
      userId,
      plainToken,
    );
    if (!token) {
      throw new UnauthorizedException(
        '유효하지 않거나 만료된 리프레시 토큰입니다.',
      );
    }
    return token;
  }

  // ─────────────────────────────────────────────
  // 로그아웃 - 해당 유저 토큰 전부 무효화
  // ─────────────────────────────────────────────
  async revokeAll(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllByUserId(userId);
  }

  // ─────────────────────────────────────────────
  // 단일 토큰 삭제 (재발급 시 이전 토큰 제거)
  // ─────────────────────────────────────────────
  async deleteOne(tokenId: string): Promise<void> {
    await this.refreshTokenRepository.deleteById(tokenId);
  }

  // ─────────────────────────────────────────────
  // 로그아웃 - 해당 유저 토큰 전부 삭제
  // ─────────────────────────────────────────────
  async deleteAll(userId: string): Promise<void> {
    await this.refreshTokenRepository.deleteAllByUserId(userId);
  }

  // ─────────────────────────────────────────────
  // 만료 토큰 정리 (배치/스케줄러에서 호출)
  // ─────────────────────────────────────────────
  async purgeExpired(): Promise<void> {
    await this.refreshTokenRepository.deleteExpired();
  }

  // ─────────────────────────────────────────────
  // Private: 만료 시각 계산
  // ─────────────────────────────────────────────
  private calcExpiresAt(expiresIn: string): Date {
    const units: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      // 기본 7일
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const [, amount, unit] = match;
    return new Date(Date.now() + Number(amount) * (units[unit] ?? 1000));
  }
}
