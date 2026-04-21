import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { login } from "../api/AuthApi"
import useAuthStore from "../store/AuthStore"
import styles from "./Auth.module.css"
import type { AxiosError } from "axios"
import apiClient from "../api/ApiClient"
import { getMyInfo } from "../api/UserApi"

type LoginForm = {
  email: string
  password: string
}

export default function Login() {
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" })
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const { setAuth, setUser } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const { data } = await login(form)
      const tokens = "data" in data ? data.data : data
      const { accessToken, refreshToken } = tokens
      setAuth(null, accessToken, refreshToken)
      apiClient.defaults.headers.common["Authorization"] =
        `Bearer ${accessToken}`

      const { data: meData } = await getMyInfo()
      const userProfile = (meData as any)?.data ?? meData
      setUser(userProfile)

      navigate("/")
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
          <Link to="/" className={styles.logoLink}>
            🍳 쿡클래스
          </Link>
          <h1 className={styles.title}>로그인</h1>
          <p className={styles.sub}>요리 여정을 이어가세요</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>이메일</label>
            <input
              type="email"
              className={styles.input}
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>비밀번호</label>
            <input
              type="password"
              className={styles.input}
              placeholder="비밀번호를 입력하세요"
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
              required
            />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className={styles.footer}>
          아직 회원이 아니신가요?{" "}
          <Link to="/signup" className={styles.link}>
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
