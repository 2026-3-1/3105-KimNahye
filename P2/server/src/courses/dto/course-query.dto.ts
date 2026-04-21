import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Category } from '../entities/enums/category.enum';
import { Difficulty } from '../entities/enums/difficulty.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

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
  @Transform(({ value }: { value: string | string[] }) =>
    Array.isArray(value) ? value : [value],
  )
  requiredTools?: string[];

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
