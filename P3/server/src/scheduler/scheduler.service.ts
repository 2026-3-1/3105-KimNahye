import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  // 매일 자정 — 만료되거나 무효화된 RefreshToken 정리
  @Cron('0 0 * * *')
  async cleanExpiredRefreshTokens(): Promise<void> {
    const result = await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where('expires_at < NOW() OR is_revoked = true')
      .execute();

    const deleted = result.affected ?? 0;
    this.logger.log(`만료된 RefreshToken ${deleted}건 삭제 완료`);
  }

  // 매일 오전 6시 — 일별 통계 로그
  @Cron('0 6 * * *')
  dailyStatsLog(): void {
    const today = new Date().toISOString().split('T')[0];
    this.logger.log(`[${today}] 일별 스케줄러 실행 완료`);
  }
}
