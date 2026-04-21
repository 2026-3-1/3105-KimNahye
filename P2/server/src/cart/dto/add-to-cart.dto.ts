import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ description: '장바구니에 담을 코스 ID' })
  @IsUUID()
  courseId: string;
}
