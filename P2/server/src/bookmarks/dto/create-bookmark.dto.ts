import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookmarkDto {
  @ApiProperty({ description: '북마크할 재생 위치 (초)' })
  @IsInt()
  @Min(0)
  positionSec: number;

  @ApiProperty({ description: '선택적 메모', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}
