import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MinioService } from 'nestjs-minio-client';

@Injectable()
export class MinioClientRepository {
  constructor(
    private readonly config: ConfigService,
    private readonly minioService: MinioService,
  ) {}

  async upload(fileName: string, buffer: Buffer, metaData: any) {
    return new Promise((resolve, reject) => {
      this.minioService.client.putObject(this.config.get('MINIO_BUCKET'), fileName, buffer, (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      });
    });
  }

  async getByName(name: string) {
    return await this.minioService.client.getObject(this.config.get('MINIO_BUCKET'), name);
  }
}
