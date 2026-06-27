import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

import { FileDto } from './dto/file.dto';

@Injectable()
export class FileRepository {
  constructor(private readonly prismaService: PrismaService) {}

  count(folderUuid: string) {
    return folderUuid
      ? this.prismaService.file.count({
          where: {
            folder: {
              some: {
                uuid: folderUuid,
              },
            },
          },
        })
      : this.prismaService.file.count({
          where: {
            folder: {
              none: {},
            },
          },
        });
  }

  getAll(folderUuid: string) {
    return folderUuid
      ? this.prismaService.file.findMany({
          where: {
            folder: {
              some: {
                uuid: folderUuid,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })
      : this.prismaService.file.findMany({
          where: {
            folder: {
              none: {},
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
  }

  create(fileDto: FileDto, folderUuid?: string) {
    if (folderUuid) {
      fileDto.folder = {
        connect: {
          uuid: folderUuid,
        },
      };
    }

    return this.prismaService.file.create({
      select: {
        uuid: true,
        name: true,
        mime: true,
        size: true,
        createdAt: true,
        updatedAt: true,
      },
      data: fileDto,
    });
  }
}
