import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getMyInfo, updateMyInfo } from "../api/UserApi"
import useAuthStore from "../store/AuthStore"
import type { UserProfile } from "../types/user/UserProfile"
import type { AxiosError } from "axios"
import styles from "./Profile.module.css"

const ROLE_LABEL: Record<string, string> = {
  teacher: "👨‍🍳 선생님",
  student: "🎓 수강생",
}

export default function Profile() {
  const navigate = useNavigate()
  const { isAuthenticated, logout, setUser } = useAuthStore()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  const [editing, setEditing] = useState(false)
  const [editEmail, setEditEmail] = useState("")
  const [editNickname, setEditNickname] = useState("")
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateError, setUpdateError] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    const fetch = async () => {
      setLoading(true)
      setError("")
      try {
        const { data } = await getMyInfo()
        const user: UserProfile = (data as any)?.data ?? data
        setProfile(user)
      } catch (err) {
        const axiosError = err as AxiosError<{ message: string }>
        setError(
          axiosError.response?.data?.message ??
            "정보를 불러오는 데 실패했습니다.",
        )
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [isAuthenticated])

  const handleEditStart = () => {
    if (!profile) return
    setEditEmail(profile.email)
    setEditNickname(profile.nickname)
    setUpdateError("")
    setEditing(true)
  }

  const handleEditCancel = () => {
    setEditing(false)
    setUpdateError("")
  }

  const handleUpdate = async () => {
    setUpdateLoading(true)
    setUpdateError("")
    try {
      const { data } = await updateMyInfo({
        email: editEmail,
        nickname: editNickname,
      })
      const result = (data as any)?.data ?? data
      const updated: UserProfile = {
        ...profile!,
        email: result.email,
        nickname: result.nickname,
      }
      setProfile(updated)
      setUser(updated)
      setEditing(false)
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>
      setUpdateError(
        axiosError.response?.data?.message ?? "수정에 실패했습니다.",
      )
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.skeletonAvatar} />
          <div className={styles.skeletonLines}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.skeletonLine} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.errorBox}>
            <span>😢</span>
            <p>{error || "프로필을 불러올 수 없습니다."}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* 프로필 카드 */}
        <div className={styles.card}>
          <div className={styles.cardTop}>
            <div className={styles.avatar}>{profile.nickname[0]}</div>
            <div className={styles.info}>
              <h1 className={styles.nickname}>{profile.nickname}</h1>
              <span className={styles.role}>
                {ROLE_LABEL[profile.role] ?? profile.role}
              </span>
            </div>
          </div>

          <div className={styles.divider} />

          {editing ? (
            <div className={styles.editForm}>
              <div className={styles.editField}>
                <label className={styles.editLabel}>이메일</label>
                <input
                  type="email"
                  className={styles.editInput}
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>
              <div className={styles.editField}>
                <label className={styles.editLabel}>닉네임</label>
                <input
                  type="text"
                  className={styles.editInput}
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                />
              </div>
              {updateError && (
                <p className={styles.updateError}>{updateError}</p>
              )}
              <div className={styles.editBtns}>
                <button
                  className={styles.saveBtn}
                  onClick={handleUpdate}
                  disabled={updateLoading}
                >
                  {updateLoading ? "저장 중..." : "저장"}
                </button>
                <button className={styles.cancelBtn} onClick={handleEditCancel}>
                  취소
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.details}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>이메일</span>
                <span className={styles.detailValue}>{profile.email}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>닉네임</span>
                <span className={styles.detailValue}>{profile.nickname}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>역할</span>
                <span className={styles.detailValue}>
                  {ROLE_LABEL[profile.role]}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>가입일</span>
                <span className={styles.detailValue}>
                  {new Date(profile.createdAt).toLocaleDateString("ko-KR")}
                </span>
              </div>
              <button className={styles.editBtn} onClick={handleEditStart}>
                정보 수정
              </button>
            </div>
          )}
        </div>
        {/* 액션 버튼 */}
        <div className={styles.actions}>
          <button
            className={styles.myCoursesBtn}
            onClick={() => navigate("/my-courses")}
          >
            📚 내 강의 보기
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </div>
    </div>
  )
}
