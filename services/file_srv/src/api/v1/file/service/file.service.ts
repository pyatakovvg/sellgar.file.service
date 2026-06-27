import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';

import { map, catchError, firstValueFrom } from 'rxjs';

import { FileUploadDto } from '../repository/dto/file-upload.dto';

import { FileRepository } from '../repository/file.repository';
import { MinioClientRepository } from '../repository/minio-client.repository';

@Injectable()
export class FileService {
  constructor(
    private readonly config: ConfigService,
    private readonly fileRepository: FileRepository,
    private readonly minioClientRepository: MinioClientRepository,
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

  async upload(dto: FileUploadDto[], folderUuid: string) {
    return await Promise.all(
      dto.map(async (file) => {
        await this.minioClientRepository.upload(file.fieldname, Buffer.from(file.buffer), {});

        const result = await this.fileRepository.create(
          {
            name: file.fieldname,
            size: file.size,
            mime: file.mimetype,
          },
          folderUuid,
        );

        await firstValueFrom(
          this.rmqService.emit(this.config.get('AMQP_FILE_SRV_FILE_CREATE'), result).pipe(
            map((data) => {
              return data;
            }),
            catchError((err) => {
              return err;
            }),
          ),
        );

        return result;
      }),
    );
  }

  getByName(fileName: string) {
    return this.minioClientRepository.getByName(fileName);
  }
}
