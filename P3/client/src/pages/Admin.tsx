import { useState, useEffect } from "react"
import {
  getAdminUsers,
  updateUserRole,
  getAdminCourses,
  deleteAdminCourse,
  getAdminPayments,
} from "../api/AdminApi"
import styles from "./Admin.module.css"

type Tab = "users" | "courses" | "payments"

interface AdminUser {
  id: string
  email: string
  nickname: string
  role: string
  createdAt: string
}

interface AdminCourse {
  id: string
  category: string
  difficulty: string
  price: number
  createdAt: string
  teacher?: { nickname: string }
}

interface AdminPayment {
  id: string
  userId: string
  courseId: string
  amount: number
  paymentKey: string
  paidAt: string
}

export default function Admin() {
  const [tab, setTab] = useState<Tab>("users")
  const [users, setUsers] = useState<AdminUser[]>([])
  const [courses, setCourses] = useState<AdminCourse[]>([])
  const [payments, setPayments] = useState<AdminPayment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchData = async (t: Tab) => {
    setLoading(true)
    setError("")
    try {
      if (t === "users") {
        const { data } = await getAdminUsers()
        setUsers(Array.isArray(data) ? data : (data as any)?.data ?? [])
      } else if (t === "courses") {
        const { data } = await getAdminCourses()
        setCourses(Array.isArray(data) ? data : (data as any)?.data ?? [])
      } else {
        const { data } = await getAdminPayments()
        setPayments(Array.isArray(data) ? data : (data as any)?.data ?? [])
      }
    } catch {
      setError("데이터를 불러오는 데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(tab)
  }, [tab])

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await updateUserRole(id, role)
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
    } catch {
      alert("역할 변경에 실패했습니다.")
    }
  }

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("강좌를 삭제하시겠습니까?")) return
    try {
      await deleteAdminCourse(id)
      setCourses((prev) => prev.filter((c) => c.id !== id))
    } catch {
      alert("강좌 삭제에 실패했습니다.")
    }
  }

  const roleBadgeClass = (role: string) => {
    if (role === "admin") return `${styles.badge} ${styles.badgeAdmin}`
    if (role === "teacher") return `${styles.badge} ${styles.badgeTeacher}`
    return `${styles.badge} ${styles.badgeStudent}`
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1 className={styles.title}>관리자 대시보드</h1>
          <p className={styles.desc}>유저, 강좌, 결제 내역을 관리합니다</p>
        </div>

        <div className={styles.tabs}>
          {(["users", "courses", "payments"] as Tab[]).map((t) => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ""}`}
              onClick={() => setTab(t)}
            >
              {t === "users" ? "유저 관리" : t === "courses" ? "강좌 관리" : "결제 내역"}
            </button>
          ))}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {/* 유저 관리 */}
        {tab === "users" && (
          <>
            <p className={styles.count}>전체 유저 {users.length}명</p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>닉네임</th>
                    <th>이메일</th>
                    <th>역할</th>
                    <th>역할 변경</th>
                    <th>가입일</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}><td colSpan={5}><div className={styles.skeleton} /></td></tr>
                      ))
                    : users.map((u) => (
                        <tr key={u.id}>
                          <td>{u.nickname}</td>
                          <td>{u.email}</td>
                          <td><span className={roleBadgeClass(u.role)}>{u.role}</span></td>
                          <td>
                            <select
                              className={styles.roleSelect}
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            >
                              <option value="student">student</option>
                              <option value="teacher">teacher</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                          <td>{new Date(u.createdAt).toLocaleDateString("ko-KR")}</td>
                        </tr>
                      ))}
                  {!loading && users.length === 0 && !error && (
                    <tr><td colSpan={5}>
                      <div className={styles.empty}>
                        <span className={styles.emptyIcon}>👤</span>
                        <p>유저가 없습니다</p>
                      </div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* 강좌 관리 */}
        {tab === "courses" && (
          <>
            <p className={styles.count}>전체 강좌 {courses.length}개</p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>카테고리</th>
                    <th>난이도</th>
                    <th>가격</th>
                    <th>강사</th>
                    <th>개설일</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}><td colSpan={7}><div className={styles.skeleton} /></td></tr>
                      ))
                    : courses.map((c) => (
                        <tr key={c.id}>
                          <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.id.slice(0, 8)}…</td>
                          <td>{c.category}</td>
                          <td>{c.difficulty}</td>
                          <td>{c.price === 0 ? "무료" : `${c.price.toLocaleString()}원`}</td>
                          <td>{c.teacher?.nickname ?? "-"}</td>
                          <td>{new Date(c.createdAt).toLocaleDateString("ko-KR")}</td>
                          <td>
                            <button
                              className={styles.deleteBtn}
                              onClick={() => handleDeleteCourse(c.id)}
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      ))}
                  {!loading && courses.length === 0 && !error && (
                    <tr><td colSpan={7}>
                      <div className={styles.empty}>
                        <span className={styles.emptyIcon}>📚</span>
                        <p>강좌가 없습니다</p>
                      </div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* 결제 내역 */}
        {tab === "payments" && (
          <>
            <p className={styles.count}>전체 결제 {payments.length}건</p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>결제 키</th>
                    <th>유저 ID</th>
                    <th>강좌 ID</th>
                    <th>금액</th>
                    <th>결제일</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}><td colSpan={5}><div className={styles.skeleton} /></td></tr>
                      ))
                    : payments.map((p) => (
                        <tr key={p.id}>
                          <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.paymentKey.slice(0, 16)}…</td>
                          <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.userId.slice(0, 8)}…</td>
                          <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.courseId.slice(0, 8)}…</td>
                          <td>{p.amount.toLocaleString()}원</td>
                          <td>{new Date(p.paidAt).toLocaleDateString("ko-KR")}</td>
                        </tr>
                      ))}
                  {!loading && payments.length === 0 && !error && (
                    <tr><td colSpan={5}>
                      <div className={styles.empty}>
                        <span className={styles.emptyIcon}>💳</span>
                        <p>결제 내역이 없습니다</p>
                      </div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
