export type CreateCourseRequest = {
  video_id: string
  category: string
  difficulty: "상" | "중" | "하"
  requiredTools: string[]
}
