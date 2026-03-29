import { Link, useNavigate, useLocation } from "react-router-dom"
import useAuthStore from "../../store/AuthStore"
import { logout } from "../../api/AuthApi"
import styles from "./Navbar.module.css"

export default function Navbar() {
  const { isAuthenticated, user, logout: clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await logout()
    } catch {}
    clearAuth()
    navigate("/")
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>🍳</span>
          <span className={styles.logoText}>끼니해결</span>
        </Link>

        <div className={styles.links}>
          <Link
            to="/courses"
            className={`${styles.link} ${isActive("/courses") ? styles.active : ""}`}
          >
            강의 탐색
          </Link>
          {isAuthenticated && (
            <Link
              to="/my-courses"
              className={`${styles.link} ${isActive("/my-courses") ? styles.active : ""}`}
            >
              내 강의
            </Link>
          )}
          {isAuthenticated && user?.role === "teacher" && (
            <Link
              to="/teacher"
              className={`${styles.link} ${isActive("/teacher") ? styles.active : ""}`}
            >
              강의 관리
            </Link>
          )}
        </div>

        <div className={styles.actions}>
          {isAuthenticated ? (
            <>
              <Link to="/profile" className={styles.avatarBtn}>
                <span className={styles.avatar}>
                  {user?.nickname?.[0] ?? "나"}
                </span>
              </Link>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.loginBtn}>
                로그인
              </Link>
              <Link to="/signup" className={styles.signupBtn}>
                무료 시작
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
