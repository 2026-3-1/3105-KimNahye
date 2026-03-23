import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user/user.module';
import {
  HttpExceptionFilter,
  AllExceptionFilter,
} from './common/filters/exception.filter';
import { CoursesModule } from './courses/courses.module';
import { VideosModule } from './videos/videos.module';

@Module({
  imports: [
    // 환경변수 전역 로드
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM - PostgreSQL 연결
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: config.get('NODE_ENV') !== 'prod',
        ssl:
          config.get('NODE_ENV') === 'prod'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),

    AuthModule,
    UsersModule,
    CoursesModule,
    VideosModule,
  ],
  providers: [
    // 전역 ValidationPipe
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          whitelist: true, // DTO에 없는 필드 자동 제거
          forbidNonWhitelisted: true, // 허용되지 않은 필드 요청 시 에러
          transform: true, // 타입 자동 변환
          transformOptions: {
            enableImplicitConversion: true,
          },
        }),
    },
    // 전역 예외 필터 (구체적인 것 먼저)
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
