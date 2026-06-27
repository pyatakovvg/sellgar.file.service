import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { PrismaService } from '@/prisma/prisma.service';

import { FileService } from './service/file.service';
import { FileRepository } from './repository/file.repository';
import { FileController } from './controller/file.controller';
import { MinioClientRepository } from './repository/minio-client.repository';

@Module({
  imports: [
    ConfigModule,

    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'FILE_SERVICE',
        useFactory: async (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              {
                port: config.get('AMQP_PORT'),
                hostname: config.get('AMQP_HOSTNAME'),
                username: config.get('AMQP_USERNAME'),
                password: config.get('AMQP_PASSWORD'),
              },
            ],
            persistent: true,
            queue: config.get('AMQP_SERVICE_QUEUE'),
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [FileController],
  providers: [PrismaService, FileService, FileRepository, MinioClientRepository, ConfigService],
})
export class FileModule {}
