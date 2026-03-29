import { CreateCourseRequest } from "../types/course/CreateCourseRequest"
import { GetCoursesParams } from "../types/course/GetCourseParams"
import apiClient from "./ApiClient"

// Course APIs
export const getCourses = (params: GetCoursesParams) =>
  apiClient.get("/courses/list", { params })
export const getCourse = (id: string) => apiClient.get(`/courses/${id}`)
export const createCourse = (data: CreateCourseRequest) =>
  apiClient.post("/courses", data)
export const getMyCourses = () => apiClient.get("/courses/my")
