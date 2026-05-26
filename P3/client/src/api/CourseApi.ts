import { CreateCourseRequest } from "../types/course/CreateCourseRequest"
import { GetCoursesParams } from "../types/course/GetCourseParams"
import apiClient from "./ApiClient"

// Course APIs
export const getCourses = (params: GetCoursesParams, signal?: AbortSignal) =>
  apiClient.get("/courses/list", { params, signal })
export const getCourse = (id: string) => apiClient.get(`/courses/${id}`)
export const createCourse = (data: CreateCourseRequest) =>
  apiClient.post("/teacher", data)
export const updateCourse = (id: string, data: Partial<CreateCourseRequest>) =>
  apiClient.patch(`/teacher/${id}`, data)
export const getTeacherCourses = () => apiClient.get("/teacher")
export const getMyCourses = () => apiClient.get("/courses/my")
