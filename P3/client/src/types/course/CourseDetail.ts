import { CourseTeacher } from "./CourseTeacher"
import { CourseVideo } from "./CourseVideo"

export type CourseDetail = {
  id: string
  teacher: CourseTeacher
  videos: CourseVideo[]
  category: string
  difficulty: "상" | "중" | "하"
  requiredTools: string[]
  videoCount: number
  price: number
  createdAt: string // ISO8601
  updatedAt: string // ISO8601
}
