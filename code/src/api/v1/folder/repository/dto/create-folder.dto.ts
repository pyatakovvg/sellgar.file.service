import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  name: string;

  @IsUUID()
  @IsOptional()
  parentUuid?: string;
}
