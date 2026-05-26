import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { compare, hash } from 'bcrypt';
import { RefreshToken } from '../entities/refresh-token.entity';
import { IRefreshTokenRepository } from '../interfaces/refresh-token-repository.interface';

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repo: Repository<RefreshToken>,
  ) {}

  async save(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<RefreshToken> {
    const hashed = await hash(token, 10);
    const entity = this.repo.create({
      userId,
      token: hashed,
      expiresAt,
      isRevoked: false,
    });
    return this.repo.save(entity);
  }

  // 유효한 토큰 목록 중 bcrypt로 일치하는 것을 반환
  async findValidToken(
    userId: string,
    plainToken: string,
  ): Promise<RefreshToken | null> {
    const tokens = await this.repo.find({
      where: { userId, isRevoked: false },
    });

    for (const t of tokens) {
      if (t.isExpired()) continue;
      const isMatch = await compare(plainToken, t.token);
      if (isMatch) return t;
    }

    return null;
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.repo.update({ userId, isRevoked: false }, { isRevoked: true });
  }

  async deleteById(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await this.repo.delete({ userId });
  }

  async deleteExpired(): Promise<void> {
    await this.repo.delete({ expiresAt: LessThan(new Date()) });
  }
}
