export type UserProfile = {
  id: string
  email: string
  nickname: string
  role: "teacher" | "student"
  owned_tools: string[]
  level: number
  created_at: string // ISO8601
}
