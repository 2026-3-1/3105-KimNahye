export type UserProfile = {
  id: string
  email: string
  nickname: string
  role: "teacher" | "student" | "admin"
  createdAt: string
}
