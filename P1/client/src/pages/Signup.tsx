import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { register } from "../api/AuthApi"
import styles from "./Auth.module.css"
import type { RegisterRequest } from "../types/auth/RegisterRequest"
import type { AxiosError } from "axios"

export default function Signup() {
  const [form, setForm] = useState<RegisterRequest>({
    email: "",
    password: "",
    nickname: "",
    role: "student",
  })
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await register(form)
      navigate("/login")
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>
      setError(axiosError.response?.data?.message ?? "회원가입에 실패했습니다.")
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
          <h1 className={styles.title}>회원가입</h1>
          <p className={styles.sub}>요리 여정을 시작해보세요</p>
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
            <label className={styles.label}>닉네임</label>
            <input
              type="text"
              className={styles.input}
              placeholder="닉네임"
              value={form.nickname}
              onChange={(e) =>
                setForm((p) => ({ ...p, nickname: e.target.value }))
              }
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>비밀번호</label>
            <input
              type="password"
              className={styles.input}
              placeholder="비밀번호 (8자 이상)"
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>역할</label>
            <div className={styles.roleGroup}>
              <button
                type="button"
                className={`${styles.roleBtn} ${form.role === "student" ? styles.roleActive : ""}`}
                onClick={() => setForm((p) => ({ ...p, role: "student" }))}
              >
                🎓 수강생
              </button>
              <button
                type="button"
                className={`${styles.roleBtn} ${form.role === "teacher" ? styles.roleActive : ""}`}
                onClick={() => setForm((p) => ({ ...p, role: "teacher" }))}
              >
                👨‍🍳 선생님
              </button>
            </div>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <p className={styles.footer}>
          이미 회원이신가요?{" "}
          <Link to="/login" className={styles.link}>
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
