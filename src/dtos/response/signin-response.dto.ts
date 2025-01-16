
import { IsNotEmpty, IsString } from 'class-validator';

export class SignInResponseDto {
  @IsNotEmpty()
  @IsString()
  idToken: string;

  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
