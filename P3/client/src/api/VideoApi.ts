import { RegisterVideoRequest } from "../types/video/RegisterVideoRequest"
import apiClient from "./ApiClient"
// Video APIs
export const registerVideo = (request: RegisterVideoRequest) =>
  apiClient.post("/videos", request)
export const getVideo = (id: string) => apiClient.get(`/videos/${id}`)
