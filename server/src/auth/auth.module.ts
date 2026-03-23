import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { UsersModule } from 'src/user/user.module';
import { TokenService } from './services/token.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { REFRESH_TOKEN_REPOSITORY } from './interfaces/refresh-token-repository.interface';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([RefreshToken]),
    PassportModule.register({ defaultStrategy: 'jwt-access' }),
    // JwtModule은 비동기로 등록 — ConfigService에서 secret을 주입
    // (각 signAsync 호출 시 secret을 override하므로 여기선 기본값만 설정)
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.get<string>('JWT_SECRET_KEY'),
        signOptions: {
          expiresIn: config.get<string>(
            'JWT_ACCESS_TOKEN_EXPIRES_IN',
            '1h',
          ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    TokenService,
    RefreshTokenService,
    {
      provide: REFRESH_TOKEN_REPOSITORY, // ← 이 블록이 있는지 확인
      useClass: RefreshTokenRepository,
    },
  ],
  exports: [AuthService, JwtAccessStrategy, PassportModule],
})
export class AuthModule {}
