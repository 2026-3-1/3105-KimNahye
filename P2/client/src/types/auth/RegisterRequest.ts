export type RegisterRequest = {
  email: string
  password: string
  nickname: string
  role: "teacher" | "student"
}
