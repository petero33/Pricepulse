import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: [
      configService.get('FRONTEND_URL') || 'http://localhost:3000',
      'http://localhost:4200', // Flutter web dev
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Global validation pipe — strips unknown fields, enables class-transformer
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger docs (only in non-production or if explicitly enabled)
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('PricePulse Kenya API')
      .setDescription(
        'Real-time retail price intelligence platform. ' +
          'Compare basket prices across Kenyan supermarkets.',
      )
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'JWT-auth',
      )
      .addTag('auth', 'Authentication & authorization')
      .addTag('users', 'User profiles & reputation')
      .addTag('products', 'Product catalog')
      .addTag('stores', 'Store chains & branches')
      .addTag('prices', 'Price reports & history')
      .addTag('search', 'Product search (Elasticsearch)')
      .addTag('shopping', 'Shopping baskets & comparison')
      .addTag('health', 'Service health check')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    logger.log(`📖 Swagger docs: http://localhost:${port}/api/docs`);
  }

  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 PricePulse API running on port ${port} [${nodeEnv}]`);
}

bootstrap();
