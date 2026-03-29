import apiClient from "./ApiClient"
// Video APIs
export const getVideo = (id: string) => apiClient.get(`/videos/${id}`)
export const registerVideo = (youtube_video_id: string) =>
  apiClient.post("/videos", { youtube_video_id })
