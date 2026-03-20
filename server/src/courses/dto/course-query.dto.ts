import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Category } from '../entities/enums/category.enum';
import { Difficulty } from '../entities/enums/difficulty.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CourseQueryDto {
  @IsOptional()
  @IsEnum(Category)
  @ApiPropertyOptional({ enum: Category, enumName: 'Category' })
  category?: Category;

  @IsOptional()
  @IsEnum(Difficulty)
  @ApiPropertyOptional({ enum: Difficulty, enumName: 'Difficulty' })
  difficulty?: Difficulty;

  @IsOptional()
  @IsString()
  tools?: string;

  @IsOptional()
  @IsNumber()
  max_duration?: number;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
