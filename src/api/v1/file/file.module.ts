import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileService } from './service/file.service';
import { FileRepository } from './repository/file.repository';
import { FileController } from './controller/file.controller';
import { FileModel } from './file.model';
import { FolderModel } from '../folder/folder.model';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([FileModel, FolderModel]),

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
            exchange: config.get('AMQP_EVENTS_EXCHANGE'),
            exchangeType: 'topic',
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [FileController],
  providers: [FileService, FileRepository, ConfigService],
})
export class FileModule {}
