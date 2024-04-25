import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as morgan from 'morgan';
import { LoggerService } from './logger/logger.service';
import { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'],
  });
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const configService = app.get(ConfigService);
  const NODE_ENV = configService.getOrThrow<string>('NODE_ENV');
  const APP_PORT = configService.getOrThrow<number>('APP_PORT');

  const loggerService = app.get(LoggerService);

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

  const morganMiddleware = morgan(
    ':method :url :status :res[content-length] - :response-time ms',
    {
      stream: {
        // Configure Morgan to use our custom logger with the http severity
        write: (message) =>
          loggerService
            .getLogger()
            .child({ label: 'API' })
            .http(message.trim()),
      },
    },
  );
  app.use(morganMiddleware);

  // to return nothing if front-end request for favicon
  app.use(function (req: Request, res: Response, next: NextFunction) {
    if (req.originalUrl && req.originalUrl.split('/').pop() === 'favicon.ico') {
      return res.sendStatus(204);
    }
    next();
  });

  await app.listen(APP_PORT);
}
bootstrap();
