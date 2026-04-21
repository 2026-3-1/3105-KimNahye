export type GetCoursesParams = {
  category?:
    | "KOREAN"
    | "JAPANESE"
    | "CHINESE"
    | "WESTERN"
    | "BAKING"
    | "SIDE_DISH"
    | "ONE_DISH"
  difficulty?: "HIGH" | "MEDIUM" | "LOW"
  requiredTools?: string[]
  duration?: number
  page?: number
  limit?: number
}
