import { Module } from '@nestjs/common';
import { MinioModule } from 'nestjs-minio-client';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ApiV1Module } from '@/api/v1/api.module';

import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: './.env', isGlobal: true }),

    MinioModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          useSSL: false,
          endPoint: config.get('MINIO_ENDPOINT'),
          port: Number(config.get('MINIO_PORT')),
          accessKey: config.get('MINIO_ACCESS_KEY'),
          secretKey: config.get('MINIO_SECRET_KEY'),
        };
      },
    }),

    PrismaModule,
    ApiV1Module,
  ],
})
export class AppModule {}
