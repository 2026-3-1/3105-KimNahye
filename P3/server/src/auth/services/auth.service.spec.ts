import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { TokenService } from './token.service';
import { RefreshTokenService } from './refresh-token.service';
import { UserRole } from 'src/common/enums/user-role.enum';

const mockUser = {
  id: 'user-uuid',
  email: 'test@example.com',
  nickname: '테스터',
  role: UserRole.STUDENT,
  validatePassword: jest.fn(),
};

const mockTokens = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
};

const mockUserService = {
  findByEmail: jest.fn(),
  findByEmailWithPassword: jest.fn(),
  create: jest.fn(),
};

const mockTokenService = {
  generateTokens: jest.fn(),
};

const mockRefreshTokenService = {
  save: jest.fn(),
  validate: jest.fn(),
  deleteOne: jest.fn(),
  deleteAll: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: RefreshTokenService, useValue: mockRefreshTokenService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    const dto = {
      email: 'new@example.com',
      password: 'Password1!',
      nickname: '신규',
      role: UserRole.STUDENT,
    };

    it('이미 존재하는 이메일이면 ConflictException을 던진다', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('회원가입 성공 시 id/email/nickname/role을 반환한다', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue(mockUser);

      const result = await service.register(dto);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        nickname: mockUser.nickname,
        role: mockUser.role,
      });
    });
  });

  describe('login', () => {
    const dto = { email: 'test@example.com', password: 'Password1!' };

    it('존재하지 않는 이메일이면 UnauthorizedException을 던진다', async () => {
      mockUserService.findByEmailWithPassword.mockResolvedValue(null);
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('비밀번호가 틀리면 UnauthorizedException을 던진다', async () => {
      mockUserService.findByEmailWithPassword.mockResolvedValue(mockUser);
      mockUser.validatePassword.mockResolvedValue(false);
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('로그인 성공 시 accessToken과 refreshToken을 반환한다', async () => {
      mockUserService.findByEmailWithPassword.mockResolvedValue(mockUser);
      mockUser.validatePassword.mockResolvedValue(true);
      mockTokenService.generateTokens.mockResolvedValue(mockTokens);
      mockRefreshTokenService.save.mockResolvedValue(undefined);

      const result = await service.login(dto);

      expect(result).toEqual(mockTokens);
      expect(mockRefreshTokenService.save).toHaveBeenCalledWith(
        mockUser.id,
        mockTokens.refreshToken,
      );
    });
  });

  describe('logout', () => {
    it('userId에 해당하는 모든 refreshToken을 삭제한다', async () => {
      mockRefreshTokenService.deleteAll.mockResolvedValue(undefined);
      await service.logout('user-uuid');
      expect(mockRefreshTokenService.deleteAll).toHaveBeenCalledWith('user-uuid');
    });
  });
});
