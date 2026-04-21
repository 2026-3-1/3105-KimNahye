import apiClient from "./ApiClient"

export const getCart = () => apiClient.get("/cart")
export const addToCart = (courseId: string) => apiClient.post("/cart", { courseId })
export const removeFromCart = (courseId: string) => apiClient.delete(`/cart/${courseId}`)
export const clearCart = () => apiClient.delete("/cart")
