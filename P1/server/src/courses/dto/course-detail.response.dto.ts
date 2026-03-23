import { Category } from '../entities/enums/category.enum';
import { Difficulty } from '../entities/enums/difficulty.enum';
import { TeacherItem } from './teacher-item.dto';
import { VideoItem } from './video-item.dto';

export class CourseDetailResponse {
  id: string;
  teacher: TeacherItem;
  videos: VideoItem[];
  category: Category;
  difficulty: Difficulty;
  requiredTools: string[];
  videoCount: number;
  totalDuration: number;
  createdAt: Date;
  updatedAt: Date;
}
