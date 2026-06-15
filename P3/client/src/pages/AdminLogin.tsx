import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { login } from "../api/AuthApi"
import useAuthStore from "../store/AuthStore"
import { getMyInfo } from "../api/UserApi"
import apiClient from "../api/ApiClient"
import type { AxiosError } from "axios"
import styles from "./AdminLogin.module.css"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { setAuth, setUser } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const { data } = await login({ email, password })
      const tokens = "data" in data ? (data as any).data : data
      const { accessToken, refreshToken } = tokens
      setAuth(null, accessToken, refreshToken)
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`

      const { data: meData } = await getMyInfo()
      const userProfile = (meData as any)?.data ?? meData

      if (userProfile.role !== "admin") {
        setError("관리자 계정이 아닙니다.")
        useAuthStore.getState().logout()
        return
      }

      setUser(userProfile)
      navigate("/admin")
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>
      setError(axiosError.response?.data?.message ?? "로그인에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.icon}>🛡️</span>
          <h1 className={styles.title}>관리자 로그인</h1>
          <p className={styles.sub}>Solving Meal 관리자 전용</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>이메일</label>
            <input
              type="email"
              className={styles.input}
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>비밀번호</label>
            <input
              type="password"
              className={styles.input}
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "로그인 중..." : "관리자 로그인"}
          </button>
        </form>
      </div>
    </div>
  )
}
