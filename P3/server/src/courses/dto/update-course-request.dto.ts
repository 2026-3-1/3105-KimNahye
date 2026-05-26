import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Category } from '../entities/enums/category.enum';
import { Difficulty } from '../entities/enums/difficulty.enum';

export class UpdateCourseRequest {
  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsString({ each: true })
  requiredTools?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;
}
