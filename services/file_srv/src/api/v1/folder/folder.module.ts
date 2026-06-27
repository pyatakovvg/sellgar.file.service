import { Module } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

import { FolderService } from './service/folder.service';
import { FolderRepository } from './repository/folder.repository';
import { FolderController } from './controller/folder.controller';

@Module({
  providers: [PrismaService, FolderService, FolderRepository],
  controllers: [FolderController],
})
export class FolderModule {}
