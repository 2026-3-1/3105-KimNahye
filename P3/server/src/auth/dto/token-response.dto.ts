import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';

export class TokenResponseDto {
  /**
   * JWT 액세스 토큰
   */
  @ApiProperty({ description: 'JWT 액세스 토큰' })
  accessToken: string;

  /**
   * JWT 리프레시 토큰
   */
  @ApiProperty({ description: 'JWT 리프레시 토큰' })
  refreshToken: string;
}

export class RegisterResponseDto {
  /**
   * 사용자 UUID
   * @example 550e8400-e29b-41d4-a716-446655440000
   */
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: '사용자 UUID',
  })
  id: string;

  /**
   * 이메일 주소
   * @example user@example.com
   */
  @ApiProperty({ example: 'user@example.com', description: '이메일 주소' })
  email: string;

  /**
   * 닉네임
   * @example 닉네임
   */
  @ApiProperty({ example: '닉네임', description: '닉네임' })
  nickname: string;

  /**
   * 사용자 역할
   * @example teacher
   */
  @ApiProperty({
    example: 'teacher',
    enum: UserRole,
    description: '사용자 역할',
  })
  role: UserRole;
}
