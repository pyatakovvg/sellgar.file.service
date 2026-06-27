import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

import { PrismaService } from '@/prisma/prisma.service';

import { FolderEntity } from '../folder.entity';

@Injectable()
export class FolderRepository {
  constructor(private readonly prisma: PrismaService) {}

  count(parentUuid: string = null) {
    return this.prisma.folder.count({
      where: {
        parentUuid,
      },
    });
  }

  async findAll(parentUuid: string = null) {
    const result = await this.prisma.folder.findMany({
      select: {
        uuid: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        parentUuid,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const resultInstance = plainToInstance(FolderEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  findByUuid(uuid: string) {
    return this.prisma.folder.findUnique({
      select: {
        uuid: true,
        name: true,
      },
      where: {
        uuid,
      },
    });
  }
}
