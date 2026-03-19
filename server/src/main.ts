import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 8080);
  app.setGlobalPrefix('api/v1');

  //swagger 자동화
  const swaggerConfig = new DocumentBuilder()
    .setTitle('자취생 맞춤형 요리 교육 커리큘럼 API')
    .setDescription(
      '유튜브 오픈 데이터를 활용한 자취생 맞춤형 인터랙티브 요리 교육 커리큘럼 서비스 API 문서',
    )
    .setVersion('1.0.0')
    .addTag('인증 (Auth)', '회원가입 / 로그인 / 토큰 관리')
    // Access Token용 Bearer 인증 스키마
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
    // Refresh Token용 Bearer 인증 스키마
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
      persistAuthorization: true, // 페이지 새로고침 후에도 인증 유지
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: '요리 교육 API 문서',
  });

  //cors
  app.enableCors({
    origin:
      configService.get<string>('NODE_ENV') === 'production'
        ? ['http://localhost:3000']
        : true,
    credentials: true,
  });

  await app.listen(port);
  console.log(`🚀 서버 실행 중: http://localhost:${port}`);
  console.log(`📄 Swagger 문서: http://localhost:${port}/api/docs`);
}

bootstrap();
