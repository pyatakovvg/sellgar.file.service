import { Type } from 'class-transformer';
import { Equals, IsDefined, IsUUID, ValidateNested } from 'class-validator';
import { BrandImageRemovedPayloadDto } from './brand-image-removed-payload.dto';

export class BrandImageRemovedEventDto {
  @IsUUID()
  eventUuid: string;

  @Equals('brand.images.removed')
  eventType: string;

  @Equals('product_srv_v2')
  producer: string;

  @Equals(1)
  schemaVersion: number;

  @IsDefined()
  @ValidateNested()
  @Type(() => BrandImageRemovedPayloadDto)
  payload: BrandImageRemovedPayloadDto;
}
