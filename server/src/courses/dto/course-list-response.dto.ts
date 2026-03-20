import { Category } from '../entities/enums/category.enum';
import { Difficulty } from '../entities/enums/difficulty.enum';
import { TeacherItem } from './teacher-item.dto';

export class CourseListResponse {
  id: string;
  teacher: TeacherItem;
  videoCount: number;
  category: Category;
  difficulty: Difficulty;
  requiredTools: string[];
}
