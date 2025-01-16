import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class DisconnectProfileDTO {

  @ApiProperty({
    description: ' The userId',
    type: Number,
  })
  @IsInt()
  userId: number;


  @ApiProperty({
    description: ' The platform',
    type: Number,
  })
  @IsString()
  platform: number;
}
