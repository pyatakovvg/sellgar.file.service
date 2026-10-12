import { ArrayNotEmpty, ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class BrandImageRemovedPayloadDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  imageUuids: string[];
}
