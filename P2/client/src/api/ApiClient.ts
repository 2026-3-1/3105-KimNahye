import axios from "axios"

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1"

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = localStorage.getItem("refreshToken")
        const { data } = await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh`,
          {
            refreshToken,
          },
        )
        localStorage.setItem("accessToken", data.accessToken)
        localStorage.setItem("refreshToken", data.refreshToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return apiClient(original)
      } catch {
        localStorage.clear()
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient
