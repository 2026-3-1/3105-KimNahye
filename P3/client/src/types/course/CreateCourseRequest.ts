export type CreateCourseRequest = {
  video_id?: string // optional — 영상은 강의 생성 후 별도 등록
  category:
    | "KOREAN"
    | "JAPANESE"
    | "CHINESE"
    | "WESTERN"
    | "BAKING"
    | "SIDE_DISH"
    | "ONE_DISH"
  difficulty: "HIGH" | "MEDIUM" | "LOW"
  requiredTools: string[]
  price?: number
}
