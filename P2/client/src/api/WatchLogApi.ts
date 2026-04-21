import apiClient from "./ApiClient"

export const updateProgress = (videoId: string, watchedDuration: number, isCompleted: boolean) =>
  apiClient.patch(`/videos/${videoId}/progress`, { watchedDuration, isCompleted })

export const getProgress = (videoId: string) =>
  apiClient.get(`/videos/${videoId}/progress`)
