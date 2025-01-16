import { ApiProperty } from '@nestjs/swagger';

export class LinkedInOrganizationDetailsDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  localizedName: string;

  @ApiProperty()
  logoUrl: string | null;
}
