import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { HealthService } from './health/health.service';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();
  const config = app.get(ConfigService);
  const port = Number(config.get('PORT') ?? 8080);

  const commands = app.connectMicroservice<MicroserviceOptions>({
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

  const events = app.connectMicroservice<MicroserviceOptions>({
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

  const health = app.get(HealthService);
  commands.status.subscribe((status) =>
    health.setConsumerConnected('commands', status === 'connected' || status === 'unblocked'),
  );
  events.status.subscribe((status) =>
    health.setConsumerConnected('events', status === 'connected' || status === 'unblocked'),
  );
  await app.startAllMicroservices();

  await app.listen(port, () => {
    logger.log('Service has been started on port ' + port);
  });
}

bootstrap();
