import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { FileService } from '../service/file.service';
import { BrandImageRemovedEventDto } from './dto/brand-image-removed-event.dto';

@Controller()
export class BrandImageRemovedController {
  private readonly logger = new Logger(BrandImageRemovedController.name);

  constructor(private readonly fileService: FileService) {}

  @EventPattern('brand.images.removed')
  async removed(@Payload() payload: unknown, @Ctx() context: RmqContext): Promise<void> {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    let event: BrandImageRemovedEventDto;

    try {
      event = plainToInstance(BrandImageRemovedEventDto, payload);
      await validateOrReject(event);
    } catch {
      this.logger.error('Invalid brand.images.removed event');
      channel.nack(message, false, false);
      return;
    }

    try {
      await this.fileService.deleteByUuids(event.payload.imageUuids);
      channel.ack(message);
    } catch (error) {
      this.logger.error(
        `Failed to delete images for event ${event.eventUuid}`,
        error instanceof Error ? error.stack : undefined,
      );
      channel.nack(message, false, true);
    }
  }
}
