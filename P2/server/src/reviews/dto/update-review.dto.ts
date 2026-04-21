import { IsInt, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReviewDto {
  @ApiProperty({ description: '별점 (1~5)', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: '리뷰 내용' })
  @IsString()
  content: string;
}
