
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class SignInDto {
  @ApiProperty({
    description: 'The email of the user',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Remember me option',
    type: Boolean,
    required: false,
  })
  @IsOptional() 
  @IsBoolean()
  rememberMe?: boolean; 
}
