import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum';

export class RegisterRequestDto {
  /**
   * 사용자 이메일 주소
   * @example user@example.com
   */
  @ApiProperty({ example: 'user@example.com', description: '이메일 주소' })
  @IsEmail({}, { message: '유효한 이메일 형식을 입력해주세요.' })
  email: string;

  /**
   * 비밀번호 (8~20자, 영문+숫자 포함)
   * @example password1234
   */
  @ApiProperty({ example: 'password1234', description: '비밀번호 (8~20자)' })
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(20, { message: '비밀번호는 최대 20자 이하여야 합니다.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: '비밀번호는 영문자와 숫자를 모두 포함해야 합니다.',
  })
  password: string;

  /**
   * 닉네임
   * @example 닉네임
   */
  @ApiProperty({ example: '닉네임', description: '닉네임 (2~20자)' })
  @IsString()
  @MinLength(2, { message: '닉네임은 최소 2자 이상이어야 합니다.' })
  @MaxLength(20, { message: '닉네임은 최대 20자 이하여야 합니다.' })
  nickname: string;

  /**
   * 사용자 역할
   * @example teacher
   */
  @ApiProperty({
    example: 'teacher',
    description: '사용자 역할',
    enum: UserRole,
  })
  @IsEnum(UserRole, {
    message: '유효한 역할을 입력해주세요. (student, teacher, admin)',
  })
  role: UserRole;
}

export class LoginRequestDto {
  /**
   * 사용자 이메일 주소
   * @example user@example.com
   */
  @ApiProperty({ example: 'user@example.com', description: '이메일 주소' })
  @IsEmail({}, { message: '유효한 이메일 형식을 입력해주세요.' })
  email: string;

  /**
   * 비밀번호
   * @example password1234
   */
  @ApiProperty({ example: 'password1234', description: '비밀번호' })
  @IsString()
  @MinLength(1, { message: '비밀번호를 입력해주세요.' })
  password: string;
}
