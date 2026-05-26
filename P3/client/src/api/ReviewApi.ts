import apiClient from "./ApiClient"

export const getCourseReviews = (courseId: string) =>
  apiClient.get(`/courses/${courseId}/reviews`)

export const createReview = (courseId: string, rating: number, content: string) =>
  apiClient.post(`/courses/${courseId}/reviews`, { rating, content })

export const updateReview = (courseId: string, reviewId: string, rating: number, content: string) =>
  apiClient.put(`/courses/${courseId}/reviews/${reviewId}`, { rating, content })

export const deleteReview = (courseId: string, reviewId: string) =>
  apiClient.delete(`/courses/${courseId}/reviews/${reviewId}`)
