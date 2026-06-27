import { Module } from '@nestjs/common';

import { FolderModule } from './folder/folder.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [FolderModule, FileModule],
})
export class ApiV1Module {}
