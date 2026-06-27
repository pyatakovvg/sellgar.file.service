import { Type, Expose } from 'class-transformer';
import { IsUUID, IsString, IsDate, ValidateNested } from 'class-validator';

import { Folder } from '@/prisma/client';

export class FolderEntity implements Omit<Folder, 'parentUuid'> {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @ValidateNested()
  @Type(() => FolderEntity)
  parent?: FolderEntity;

  @Expose()
  @ValidateNested()
  @Type(() => FolderEntity)
  children: FolderEntity[];

  @Expose()
  @IsDate()
  createdAt: Date;

  @Expose()
  @IsDate()
  updatedAt: Date;
}
