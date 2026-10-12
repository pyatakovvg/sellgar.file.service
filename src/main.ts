import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger();
  const config = new ConfigService();
  const app = await NestFactory.create(AppModule);

  const port = config.get<number>('PORT');

  app.connectMicroservice<MicroserviceOptions>({
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
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.connectMicroservice<MicroserviceOptions>({
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
      queue: config.getOrThrow<string>('AMQP_SERVICE_QUEUE') + '.events',
      queueOptions: { durable: true },
      exchange: config.getOrThrow<string>('AMQP_EVENTS_EXCHANGE'),
      exchangeType: 'topic',
      routingKey: 'brand.images.removed',
      noAck: false,
      persistent: true,
    },
  });

  await app.startAllMicroservices();

  await app.listen(port, () => {
    logger.log('Service has been started on port ' + port);
  });
}

bootstrap();
