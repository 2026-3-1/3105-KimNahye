import { IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { Category } from '../entities/enums/category.enum';
import { Difficulty } from '../entities/enums/difficulty.enum';

export class CreateCourseRequest {
  @IsNotEmpty()
  @IsEnum(Category)
  category: Category;

  @IsNotEmpty()
  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @IsArray()
  @IsNotEmpty()
  requiredTools: string[];
}
