import { LoginRequest } from "../types/auth/LoginRequest"
import { RegisterRequest } from "../types/auth/RegisterRequest"
import apiClient from "./ApiClient"

export const register = (data: RegisterRequest) =>
  apiClient.post("/auth/register", data)

export const login = (data: LoginRequest) => apiClient.post("/auth/login", data)

export const logout = () => apiClient.post("/auth/logout")

export const refreshToken = (refreshToken: string) =>
  apiClient.post("/auth/refresh", { refreshToken })
