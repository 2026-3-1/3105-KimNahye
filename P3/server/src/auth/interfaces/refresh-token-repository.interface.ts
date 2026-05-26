import { RefreshToken } from '../entities/refresh-token.entity';

export interface IRefreshTokenRepository {
  save(userId: string, token: string, expiresAt: Date): Promise<RefreshToken>;
  findValidToken(userId: string, token: string): Promise<RefreshToken | null>;
  revokeAllByUserId(userId: string): Promise<void>;
  deleteById(id: string): Promise<void>;
  deleteAllByUserId(userId: string): Promise<void>;
  deleteExpired(): Promise<void>;
}

export const REFRESH_TOKEN_REPOSITORY = Symbol('IRefreshTokenRepository');
