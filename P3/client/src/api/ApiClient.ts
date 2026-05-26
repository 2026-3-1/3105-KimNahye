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

const AUTH_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/refresh"]

let refreshPromise: Promise<string> | null = null

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) =>
      original?.url?.includes(path),
    )

    if (
      error.response?.status === 401 &&
      !original._retry &&
      !isAuthEndpoint
    ) {
      original._retry = true
      try {
        if (!refreshPromise) {
          refreshPromise = (async () => {
            const refreshToken = localStorage.getItem("refreshToken")
            if (!refreshToken) throw new Error("no refresh token")
            const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken,
            })
            localStorage.setItem("accessToken", data.accessToken)
            localStorage.setItem("refreshToken", data.refreshToken)
            return data.accessToken as string
          })().finally(() => {
            refreshPromise = null
          })
        }
        const newToken = await refreshPromise
        original.headers.Authorization = `Bearer ${newToken}`
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
