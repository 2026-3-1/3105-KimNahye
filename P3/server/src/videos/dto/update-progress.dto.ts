import { IsBoolean, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProgressDto {
  @ApiProperty({ description: '현재까지 시청한 초(sec)' })
  @IsInt()
  @Min(0)
  watchedDuration: number;

  @ApiProperty({ description: '영상 90% 이상 시청 시 true' })
  @IsBoolean()
  isCompleted: boolean;
}
