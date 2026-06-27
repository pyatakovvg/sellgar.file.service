import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { ApiV1Module } from '@/api/v1/api.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ['services/file_srv/.env', './.env'], isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const baseConfig: TypeOrmModuleOptions = {
          type: 'postgres' as const,
          autoLoadEntities: true,
          synchronize: true,
        };

        if (databaseUrl) {
          return {
            ...baseConfig,
            url: databaseUrl,
          };
        }

        return {
          ...baseConfig,
          host: configService.get<string>('DATABASE_HOST'),
          port: +configService.get<number>('DATABASE_PORT'),
          username: configService.get<string>('DATABASE_USERNAME'),
          password: configService.get<string>('DATABASE_PASSWORD'),
          database: configService.get<string>('DATABASE_DATABASE_NAME'),
        };
      },
      inject: [ConfigService],
    }),

    ApiV1Module,
  ],
})
export class AppModule {}
