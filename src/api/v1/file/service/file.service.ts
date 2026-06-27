import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';

import { firstValueFrom } from 'rxjs';

import { FileRepository } from '../repository/file.repository';
import { FileDto } from '../repository/dto/file.dto';

@Injectable()
export class FileService {
  constructor(
    private readonly config: ConfigService,
    private readonly fileRepository: FileRepository,
    @Inject('FILE_SERVICE') private readonly rmqService: ClientProxy,
  ) {}

  async getAll(folderUuid: string) {
    return {
      data: await this.fileRepository.getAll(folderUuid),
      meta: {
        totalRows: await this.fileRepository.count(folderUuid),
      },
    };
  }

  async getMetadataByUuid(uuid: string) {
    const file = await this.fileRepository.findByUuid(uuid);

    if (!file) {
      throw new NotFoundException(`File ${uuid} not found`);
    }

    return file;
  }

  async create(dto: FileDto) {
    const result = await this.fileRepository.create(
      {
        ...dto,
        status: dto.status ?? 'ready',
        expiresAt: dto.expiresAt ?? null,
      },
      dto.folderUuid ?? undefined,
    );

    await firstValueFrom(this.rmqService.emit(this.config.get('AMQP_FILE_SRV_FILE_CREATE'), result));

    return result;
  }

  async completeUpload(uuid: string) {
    const file = await this.getMetadataByUuid(uuid);

    if (file.status !== 'pending') {
      return file;
    }

    const result = await this.fileRepository.updateUploadState(uuid, {
      status: 'ready',
      expiresAt: null,
    });

    await firstValueFrom(this.rmqService.emit(this.config.get('AMQP_FILE_SRV_FILE_CREATE'), result));

    return result;
  }

  async deleteByUuid(uuid: string) {
    const file = await this.getMetadataByUuid(uuid);

    if (file.status === 'deleted') {
      return file;
    }

    return this.fileRepository.updateUploadState(uuid, {
      status: 'deleted',
      expiresAt: null,
    });
  }
}
