import { UpdateUserRequest } from "../types/user/UpdateUserRequest"
import apiClient from "./ApiClient"

// User APIs
export const getMyInfo = () => apiClient.get("/users/me")
export const updateMyInfo = (data: UpdateUserRequest) =>
  apiClient.patch("/users/me", data)
