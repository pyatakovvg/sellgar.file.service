import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateFolderDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUUID()
  @IsOptional()
  parentUuid?: string | null;
}
