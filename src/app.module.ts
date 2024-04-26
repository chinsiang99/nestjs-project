import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './logger/logger.module';
import { DatabaseModule } from './database/database.module';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  // comment this if do not want to automatically migrate
  async onModuleInit(): Promise<void> {
    if (process.env.MIGRATION === 'true') {
      try {
        const migrations = await this.dataSource.runMigrations();
        console.log('Database migrated successfully.');
        console.log('Successfully migrate length: ', migrations.length);
      } catch (error) {
        console.error('Error during migration:', error);
      }
    }
  }

  // for some reason the auth middlewares in profile and article modules are fired before the request context one,
  // so they would fail to access contextual EM. by registering the middleware directly in AppModule, we can get
  // around this issue
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(RouteMiddlewareMiddleware).forRoutes('*')
    consumer.apply();
    // You can configure your middleware here
    // For example, if you have a middleware named AuthMiddleware, you can apply it like this:
    // consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
