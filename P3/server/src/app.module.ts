import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import {
  HttpExceptionFilter,
  AllExceptionFilter,
} from './common/filters/exception.filter';
import { CourseModule } from './courses/course.module';
import { VideosModule } from './videos/video.module';
import { EnrollmentsModule } from './enrollments/enrollment.module';
import { TeacherModule } from './teacher/teacher.module';
import { CartModule } from './cart/cart.module';
import { ReviewModule } from './reviews/review.module';
import { BookmarkModule } from './bookmarks/bookmark.module';
import { MailModule } from './mail/mail.module';
import { PaymentModule } from './payment/payment.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [
    // 1. 환경변수 전역 로드
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 2. Winston 구조화 로그
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, context, message }) => {
              return `[${timestamp}] [${level.toUpperCase()}] [${context ?? 'App'}] ${message}`;
            }),
          ),
        }),
        new winston.transports.DailyRotateFile({
          filename: 'logs/app-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxFiles: '14d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new winston.transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxFiles: '30d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    }),

    // 3. Rate limiting — 분당 60회 (전역)
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),

    // 4. Redis 캐싱 (전역)
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        stores: [
          createKeyv(config.get<string>('REDIS_URL', 'redis://localhost:6379')),
        ],
        ttl: 300_000, // 5분 (ms)
      }),
    }),

    // 5. TypeORM - PostgreSQL 연결
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        // NODE_ENV가 'dev'일 때만 스키마 자동 동기화 (운영 DB 보호)
        synchronize: config.get('NODE_ENV') === 'dev',
        ssl:
          config.get('NODE_ENV') === 'prod'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),

    // 6. 스케줄러 (ScheduleModule.forRoot는 SchedulerModule 내부에 포함)
    ScheduleModule.forRoot(),

    // 7. 도메인 모듈
    AuthModule,
    UserModule,
    CourseModule,
    VideosModule,
    EnrollmentsModule,
    TeacherModule,
    CartModule,
    ReviewModule,
    BookmarkModule,
    MailModule,
    PaymentModule,

    // 8. 모니터링 (Health Check + Prometheus)
    MonitoringModule,

    // 9. 스케줄러 서비스
    SchedulerModule,
  ],
  providers: [
    // 전역 Rate limiting Guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
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
