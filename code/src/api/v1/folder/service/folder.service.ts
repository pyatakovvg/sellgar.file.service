import { Injectable } from '@nestjs/common';

import { FolderRepository } from '../repository/folder.repository';
import { CreateFolderDto } from '../repository/dto/create-folder.dto';
import { UpdateFolderDto } from '../repository/dto/update-folder.dto';

@Injectable()
export class FolderService {
  constructor(private readonly folderRepository: FolderRepository) {}

  findByUuid(uuid: string) {
    return this.folderRepository.findByUuid(uuid);
  }

  async findAll(parentUuid: string) {
    return {
      data: await this.folderRepository.findAll(parentUuid),
      meta: {
        totalRows: await this.folderRepository.count(parentUuid),
      },
    };
  }

  create(dto: CreateFolderDto) {
    return this.folderRepository.create(dto);
  }

  update(uuid: string, dto: UpdateFolderDto) {
    return this.folderRepository.update(uuid, dto);
  }

  remove(uuid: string) {
    return this.folderRepository.remove(uuid);
  }
}
