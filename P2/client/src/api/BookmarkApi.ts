import apiClient from "./ApiClient"

export const getBookmarks = (videoId: string) =>
  apiClient.get(`/videos/${videoId}/bookmarks`)

export const addBookmark = (videoId: string, positionSec: number, note?: string) =>
  apiClient.post(`/videos/${videoId}/bookmarks`, { positionSec, note })

export const updateBookmark = (bookmarkId: string, note: string) =>
  apiClient.patch(`/bookmarks/${bookmarkId}`, { note })

export const deleteBookmark = (bookmarkId: string) =>
  apiClient.delete(`/bookmarks/${bookmarkId}`)
