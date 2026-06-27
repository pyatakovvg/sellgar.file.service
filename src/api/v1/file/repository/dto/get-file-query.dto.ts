import { IsString, IsOptional } from 'class-validator';

export class GetFileQueryDto {
  @IsString()
  @IsOptional()
  width?: number;
}
