import { UpdateUserRequest } from "../types/user/UpdateUserRequest"
import apiClient from "./ApiClient"

// User APIs
export const getMyInfo = () => apiClient.get("/user/me")
export const updateMyInfo = (data: UpdateUserRequest) =>
  apiClient.patch("/user/me", data)
