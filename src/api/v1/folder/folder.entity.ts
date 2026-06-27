import { Type, Expose } from 'class-transformer';
import { IsUUID, IsString, IsDate, IsOptional, ValidateNested } from 'class-validator';

export class FolderEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsUUID()
  @IsOptional()
  parentUuid?: string | null;

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => FolderEntity)
  parent?: FolderEntity;

  @Expose()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FolderEntity)
  children: FolderEntity[];

  @Expose()
  @IsDate()
  createdAt: Date;

  @Expose()
  @IsDate()
  updatedAt: Date;
}
