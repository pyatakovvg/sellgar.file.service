import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { FileService } from '../service/file.service';
import { BrandImageRemovedController } from './brand-image-removed.controller';

describe('Brand image cleanup event', () => {
  const files = { deleteByUuids: jest.fn() };
  const controller = new BrandImageRemovedController(files as unknown as FileService);
  const channel = { ack: jest.fn(), nack: jest.fn() };
  const message = { fields: { deliveryTag: 1 } };
  const context = new RmqContext([message, channel, 'brand.images.removed']);
  const event = {
    eventUuid: '86f7a074-d0bf-4346-8c86-562537d1790d',
    eventType: 'brand.images.removed',
    producer: 'product_srv_v2',
    schemaVersion: 1,
    payload: { imageUuids: ['a24f8107-498d-4d79-862b-ea42154f6888'] },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    files.deleteByUuids.mockResolvedValue(undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('acknowledges only after cleanup completes', async () => {
    await controller.removed(event, context);

    expect(files.deleteByUuids).toHaveBeenCalledWith(event.payload.imageUuids);
    expect(channel.ack).toHaveBeenCalledWith(message);
    expect(channel.nack).not.toHaveBeenCalled();
    expect(files.deleteByUuids.mock.invocationCallOrder[0]).toBeLessThan(channel.ack.mock.invocationCallOrder[0]);
  });

  it('requests redelivery when cleanup fails', async () => {
    files.deleteByUuids.mockRejectedValue(new Error('Storage unavailable'));

    await controller.removed(event, context);

    expect(channel.ack).not.toHaveBeenCalled();
    expect(channel.nack).toHaveBeenCalledWith(message, false, true);
  });

  it.each([
    null,
    { ...event, producer: 'unknown' },
    { ...event, schemaVersion: 2 },
    { ...event, payload: { imageUuids: ['not-a-uuid'] } },
    { ...event, payload: { imageUuids: [] } },
    { ...event, payload: null },
  ])('rejects malformed or unsupported events without deleting files: %j', async (invalid) => {
    await controller.removed(invalid, context);

    expect(files.deleteByUuids).not.toHaveBeenCalled();
    expect(channel.ack).not.toHaveBeenCalled();
    expect(channel.nack).toHaveBeenCalledWith(message, false, false);
  });
});
