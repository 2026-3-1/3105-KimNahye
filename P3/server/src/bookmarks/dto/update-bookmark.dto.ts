import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBookmarkDto {
  @ApiProperty({ description: '북마크 메모' })
  @IsString()
  note: string;
}
