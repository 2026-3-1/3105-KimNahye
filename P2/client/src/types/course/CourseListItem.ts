import { CourseTeacher } from "./CourseTeacher"

export type CourseListItem = {
  id: string
  teacher: CourseTeacher
  videoCount: number
  category: string
  difficulty: "상" | "중" | "하"
  requiredTools: string[]
  price: number
}
