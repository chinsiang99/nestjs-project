import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'],
  });
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const configService = app.get(ConfigService);
  const NODE_ENV = configService.getOrThrow<string>('NODE_ENV');
  const APP_PORT = configService.getOrThrow<number>('APP_PORT');

  if (NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Swagger Documentation')
      .setDescription('Developer Swagger Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      // .addBasicAuth({ type: 'apiKey', in: 'header', name: 'token'}, 'token')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(APP_PORT);
}
bootstrap();
