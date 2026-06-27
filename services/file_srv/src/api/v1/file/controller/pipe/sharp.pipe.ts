import { Injectable, PipeTransform } from '@nestjs/common';

import * as path from 'path';
import * as sharp from 'sharp';

import { FileUploadDto } from '../../repository/dto/file-upload.dto';

@Injectable()
export class SharpPipe implements PipeTransform<FileUploadDto[], Promise<FileUploadDto[]>> {
  async transform(images: FileUploadDto[], meta: any): Promise<FileUploadDto[]> {
    const result = [];

    for (let index in images) {
      const image = images[index];
      const originalName = path.parse(image.originalname).name;
      const fileName = Date.now() + '-' + originalName + '.webp';
      const sharpImage = sharp(image.buffer);
      const imageMeta = await sharpImage.metadata();

      if (imageMeta.width > 800 && imageMeta.height > 800) {
        sharpImage.resize({ height: 800 });
      } else if (imageMeta.width > 800) {
        sharpImage.resize({ width: 800 });
      } else if (imageMeta.height > 800) {
        sharpImage.resize({ height: 800 });
      }

      sharpImage.webp({ preset: 'photo' });

      result.push({
        ...image,
        mimetype: 'image/webp',
        fieldname: fileName,
        buffer: await sharpImage.toBuffer(),
      });
    }

    return result;
  }
}
