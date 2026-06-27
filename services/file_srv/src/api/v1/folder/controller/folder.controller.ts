import { Controller, Get, Query, Param } from '@nestjs/common';

import { FolderService } from '../service/folder.service';

@Controller('v1/folders')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Get(':uuid')
  findByUuid(@Param('uuid') uuid: string) {
    return this.folderService.findByUuid(uuid);
  }

  @Get()
  findAll(@Query('parentUuid') parentUuid: string) {
    return this.folderService.findAll(parentUuid);
  }
}
