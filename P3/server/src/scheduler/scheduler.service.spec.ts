import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SchedulerService } from './scheduler.service';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';

const mockQueryBuilder = {
  delete: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  execute: jest.fn(),
};

const mockRefreshTokenRepository = {
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
};

describe('SchedulerService', () => {
  let service: SchedulerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: mockRefreshTokenRepository,
        },
      ],
    }).compile();

    service = module.get<SchedulerService>(SchedulerService);
    jest.clearAllMocks();
  });

  describe('cleanExpiredRefreshTokens', () => {
    it('만료되거나 무효화된 RefreshToken을 삭제하고 건수를 로그로 남긴다', async () => {
      mockQueryBuilder.execute.mockResolvedValue({ affected: 5 });

      await service.cleanExpiredRefreshTokens();

      expect(mockRefreshTokenRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });

    it('삭제 결과가 null이어도 오류 없이 완료된다', async () => {
      mockQueryBuilder.execute.mockResolvedValue({ affected: null });
      await expect(service.cleanExpiredRefreshTokens()).resolves.toBeUndefined();
    });
  });

  describe('dailyStatsLog', () => {
    it('예외 없이 정상 실행된다', () => {
      expect(() => service.dailyStatsLog()).not.toThrow();
    });
  });
});
