import { ApiResponse } from "../types/ApiResponse"
import { EnrollmentData } from "../types/enrollment/EnrollmentData"
import apiClient from "./ApiClient"
// Enrollment
export const enrollCourse = (courseId: string) =>
  apiClient.post<ApiResponse<EnrollmentData>>(`/courses/${courseId}/enroll`)
