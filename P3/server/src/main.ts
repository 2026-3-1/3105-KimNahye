import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Winston 구조화 로그 적용
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 8080);
  const isDev = configService.get<string>('NODE_ENV') !== 'prod';

  app.setGlobalPrefix('api/v1');

  // 보안 헤더 (CSP, HSTS, X-Frame-Options 등)
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  // CORS — 허용 출처를 환경변수로 명시적 제한
  const clientUrl = configService.get<string>('CLIENT_URL', 'http://localhost:5173');
  app.enableCors({
    origin: clientUrl.split(',').map((u) => u.trim()),
    credentials: true,
  });

  // Swagger — 개발 환경에서만 노출
  if (isDev) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('자취생 맞춤형 요리 교육 커리큘럼 API')
      .setDescription(
        '유튜브 오픈 데이터를 활용한 자취생 맞춤형 인터랙티브 요리 교육 커리큘럼 서비스 API 문서',
      )
      .setVersion('1.0.0')
      .addTag('인증 (Auth)', '회원가입 / 로그인 / 토큰 관리')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'JWT 액세스 토큰을 입력하세요.',
          in: 'header',
        },
        'access-token',
      )
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'JWT 리프레시 토큰을 입력하세요.',
          in: 'header',
        },
        'refresh-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
      customSiteTitle: '요리 교육 API 문서',
    });
  }

  await app.listen(port);
  console.log(`🚀 서버 실행 중: http://localhost:${port}`);
  if (isDev) {
    console.log(`📄 Swagger 문서: http://localhost:${port}/api/docs`);
  }
}

bootstrap();
