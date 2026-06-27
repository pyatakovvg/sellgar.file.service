import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FolderService } from './service/folder.service';
import { FolderRepository } from './repository/folder.repository';
import { FolderController } from './controller/folder.controller';
import { FolderModel } from './folder.model';

@Module({
  imports: [TypeOrmModule.forFeature([FolderModel])],
  providers: [FolderService, FolderRepository],
  controllers: [FolderController],
})
export class FolderModule {}
