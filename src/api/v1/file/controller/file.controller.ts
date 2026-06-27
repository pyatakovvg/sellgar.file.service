import { Controller, Get, Query } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { FileService } from '../service/file.service';
import { FileDto } from '../repository/dto/file.dto';

@Controller('v1/files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get()
  getAll(@Query('folderUuid') folderUuid: string) {
    return this.fileService.getAll(folderUuid);
  }

  @MessagePattern({ cmd: 'file.getAll' })
  getAllMessage(@Payload('folderUuid') folderUuid?: string) {
    return this.fileService.getAll(folderUuid);
  }

  @MessagePattern({ cmd: 'file.getByUuid' })
  getMetadataByUuid(@Payload('uuid') uuid: string) {
    return this.fileService.getMetadataByUuid(uuid);
  }

  @MessagePattern({ cmd: 'file.create' })
  create(@Payload() dto: FileDto) {
    return this.fileService.create(dto);
  }

  @MessagePattern({ cmd: 'file.completeUpload' })
  completeUpload(@Payload('uuid') uuid: string) {
    return this.fileService.completeUpload(uuid);
  }

  @MessagePattern({ cmd: 'file.delete' })
  deleteByUuid(@Payload('uuid') uuid: string) {
    return this.fileService.deleteByUuid(uuid);
  }
}
