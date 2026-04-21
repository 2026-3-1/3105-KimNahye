import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserRequestDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;
}
