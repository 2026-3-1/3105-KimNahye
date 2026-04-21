import { CreateCourseRequest } from "../types/course/CreateCourseRequest"
import { GetCoursesParams } from "../types/course/GetCourseParams"
import apiClient from "./ApiClient"

// Course APIs
export const getCourses = (params: GetCoursesParams) =>
  apiClient.get("/courses/list", { params })
export const getCourse = (id: string) => apiClient.get(`/courses/${id}`)
// 강의 생성: /courses → /teacher
export const createCourse = (data: CreateCourseRequest) =>
  apiClient.post("/teacher", data)

// 선생님 강의 목록 조회 추가
export const getTeacherCourses = () => apiClient.get("/teacher")
export const getMyCourses = () => apiClient.get("/courses/my")
