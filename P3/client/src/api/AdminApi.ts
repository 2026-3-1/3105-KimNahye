import apiClient from "./ApiClient"

export const getAdminUsers = () => apiClient.get("/admin/users")
export const updateUserRole = (id: string, role: string) =>
  apiClient.patch(`/admin/users/${id}/role`, { role })
export const getAdminCourses = () => apiClient.get("/admin/courses")
export const deleteAdminCourse = (id: string) =>
  apiClient.delete(`/admin/courses/${id}`)
export const getAdminPayments = () => apiClient.get("/admin/payments")
