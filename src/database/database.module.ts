import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.getOrThrow('MYSQL_HOST'),
        port: configService.getOrThrow<number>('MYSQL_PORT'),
        database: configService.getOrThrow('MYSQL_DB'),
        username: configService.getOrThrow('MYSQL_USER'),
        password: configService.getOrThrow('MYSQL_PASSWORD'),
        // entities: [__dirname + '/**/*.entity{.ts,.js}'], // this is to specify where are the entities to look for
        // entities: [user, Profile], // or we can just make it one by one, better
        autoLoadEntities: true, // auto load entities so that we no need to specify where to look up for
        synchronize: configService.getOrThrow('MYSQL_SYNCHRONIZE') === 'true',
        logging: configService.getOrThrow<string>('LOG_LEVEL') === 'debug',
        migrations: ['dist/migrations/*{.ts,.js}'],
        migrationsTableName: 'migrations_history',
        migrationsRun: false,
        // cli: {
        //   migrationsDir: "src/migrations"
        // }
      }),
      inject: [ConfigService], //
    }),
    // below is how we specify multiple database connection
    // TypeOrmModule.forRootAsync({
    //   name: 'poc-database2',
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'mysql',
    //     host: configService.getOrThrow('MYSQL_HOST'),
    //     // host: process.env.MYSQL_HOST,
    //     port: +configService.getOrThrow<number>('MYSQL_PORT'),
    //     // port: +process.env.MYSQL_PORT,
    //     database: 'poc-2',
    //     // database: process.env.MYSQL_DB,
    //     username: configService.getOrThrow('MYSQL_USER'),
    //     // username: process.env.MYSQL_USER,
    //     password: configService.getOrThrow('MYSQL_PASSWORD'),
    //     // password: process.env.MYSQL_PASSWORD,////
    //     // entities: [__dirname + '/**/*.entity{.ts,.js}'], // this is to specify where are the entities to look for
    //     autoLoadEntities: true,
    //     // synchronize: configService.getOrThrow('MYSQL_SYNCHRONIZE') === 'true',
    //     synchronize: true,
    //     // debug: configService.getOrThrow<string>('LOG_LEVEL') === 'debug',
    //   }),
    //   inject: [ConfigService], //
    // }),
  ],
})
export class DatabaseModule {}
