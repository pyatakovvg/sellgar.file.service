import { HealthModule } from './health/health.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { ApiV1Module } from './api/v1/api.module';
import { FileDatabaseOptions } from './database/file-database.options';

@Module({
  imports: [
    HealthModule,
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (): TypeOrmModuleOptions => FileDatabaseOptions.create(process.env),
      inject: [ConfigService],
    }),

    ApiV1Module,
  ],
})
export class AppModule {}
