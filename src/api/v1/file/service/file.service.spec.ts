import 'reflect-metadata';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import { FileRepository } from '../repository/file.repository';
import { FileService } from './file.service';

describe('File deletion', () => {
  const repository = { findByUuid: jest.fn(), updateUploadState: jest.fn() };
  const mediaClient = { send: jest.fn() };
  const service = new FileService(
    {} as ConfigService,
    repository as unknown as FileRepository,
    {} as ClientProxy,
    mediaClient as unknown as ClientProxy,
  );
  const file = { uuid: 'image', storageKey: 'images/image.webp', status: 'ready' };

  beforeEach(() => {
    jest.clearAllMocks();
    repository.findByUuid.mockResolvedValue(file);
    mediaClient.send.mockReturnValue(of({ storageKey: file.storageKey }));
  });

  it('removes the storage object before marking metadata as deleted', async () => {
    await service.deleteByUuid(file.uuid);

    expect(mediaClient.send).toHaveBeenCalledWith({ cmd: 'media.object.delete' }, { storageKey: file.storageKey });
    expect(repository.updateUploadState).toHaveBeenCalledWith(file.uuid, { status: 'deleted', expiresAt: null });
    expect(mediaClient.send.mock.invocationCallOrder[0]).toBeLessThan(
      repository.updateUploadState.mock.invocationCallOrder[0],
    );
  });

  it('leaves metadata unchanged and propagates a storage failure for redelivery', async () => {
    const failure = new Error('Media unavailable');
    mediaClient.send.mockReturnValue(throwError(() => failure));

    await expect(service.deleteByUuid(file.uuid)).rejects.toBe(failure);
    expect(repository.updateUploadState).not.toHaveBeenCalled();
  });

  it('does not repeat deletion after an already completed delivery', async () => {
    repository.findByUuid.mockResolvedValue({ ...file, status: 'deleted' });

    await service.deleteByUuid(file.uuid);
    expect(mediaClient.send).not.toHaveBeenCalled();
    expect(repository.updateUploadState).not.toHaveBeenCalled();
  });

  it('continues batch cleanup when one of the files no longer exists', async () => {
    repository.findByUuid.mockResolvedValueOnce(null).mockResolvedValueOnce(file);

    await service.deleteByUuids(['missing', file.uuid]);
    expect(repository.updateUploadState).toHaveBeenCalledWith(file.uuid, { status: 'deleted', expiresAt: null });
  });

  it('still reports a missing file for a direct deletion command', async () => {
    repository.findByUuid.mockResolvedValue(null);

    await expect(service.deleteByUuid('missing')).rejects.toThrow(NotFoundException);
    expect(mediaClient.send).not.toHaveBeenCalled();
  });
});
