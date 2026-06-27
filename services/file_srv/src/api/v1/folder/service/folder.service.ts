import { Injectable } from '@nestjs/common';

import { FolderRepository } from '../repository/folder.repository';

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
}
