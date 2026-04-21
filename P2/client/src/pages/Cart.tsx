import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { getCart, removeFromCart, clearCart } from "../api/CartApi"
import { enrollCourse } from "../api/EnrollmentApi"
import useAuthStore from "../store/AuthStore"
import styles from "./Cart.module.css"

interface CartItem {
  id: string
  courseId: string
  category: string
  difficulty: string
  teacher: { id: string; name: string }
  videoCount: number
  price: number
  addedAt: string
}

const DIFFICULTY_LABEL: Record<string, string> = {
  HIGH: "상",
  MEDIUM: "중",
  LOW: "하",
}

const CATEGORY_LABEL: Record<string, string> = {
  KOREAN: "한식",
  JAPANESE: "일식",
  CHINESE: "중식",
  WESTERN: "양식",
  BAKING: "베이킹",
  SIDE_DISH: "반찬",
  ONE_DISH: "일품요리",
}

export default function Cart() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [paying, setPaying] = useState(false)
  const [paySuccess, setPaySuccess] = useState(false)

  const fetchCart = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const { data } = await getCart()
      const cartData = (data as any)?.data ?? data
      setItems(cartData.items ?? [])
    } catch {
      setError("장바구니를 불러오는 데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }
    fetchCart()
  }, [isAuthenticated, fetchCart, navigate])

  const handleRemove = async (courseId: string) => {
    try {
      await removeFromCart(courseId)
      setItems((prev) => prev.filter((item) => item.courseId !== courseId))
    } catch {
      alert("삭제에 실패했습니다.")
    }
  }

  const handleClear = async () => {
    if (!confirm("장바구니를 모두 비우겠습니까?")) return
    try {
      await clearCart()
      setItems([])
    } catch {
      alert("비우기에 실패했습니다.")
    }
  }

  const handlePayment = async () => {
    if (items.length === 0) return
    setPaying(true)
    try {
      // 장바구니 내 모든 강의 수강 신청 처리
      await Promise.all(items.map((item) => enrollCourse(item.courseId).catch(() => {})))
      await clearCart()
      setItems([])
      setPaySuccess(true)
    } catch {
      alert("결제에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setPaying(false)
    }
  }

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0)

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <p className={styles.loading}>불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (paySuccess) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.successBox}>
            <span className={styles.successIcon}>🎉</span>
            <h2 className={styles.successTitle}>결제 완료!</h2>
            <p className={styles.successDesc}>수강 신청이 완료되었습니다. 바로 강의를 시작해보세요.</p>
            <button className={styles.browseBtn} onClick={() => navigate("/my-courses")}>
              내 강의 보기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1 className={styles.title}>🛒 장바구니</h1>
          {items.length > 0 && (
            <button className={styles.clearBtn} onClick={handleClear}>
              전체 비우기
            </button>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {items.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🛒</span>
            <p>장바구니가 비어 있습니다.</p>
            <button className={styles.browseBtn} onClick={() => navigate("/courses")}>
              강의 둘러보기
            </button>
          </div>
        ) : (
          <>
            <ul className={styles.list}>
              {items.map((item) => (
                <li key={item.id} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <span className={styles.category}>
                      {CATEGORY_LABEL[item.category] ?? item.category}
                    </span>
                    <span className={styles.teacher}>👨‍🍳 {item.teacher.name}</span>
                    <span className={styles.meta}>
                      📹 {item.videoCount}강 &nbsp;|&nbsp; 난이도{" "}
                      {DIFFICULTY_LABEL[item.difficulty] ?? item.difficulty}
                    </span>
                  </div>
                  <div className={styles.itemRight}>
                    <span className={styles.itemPrice}>{item.price.toLocaleString()}원</span>
                    <div className={styles.itemActions}>
                      <button
                        className={styles.detailBtn}
                        onClick={() => navigate(`/courses/${item.courseId}`)}
                      >
                        상세보기
                      </button>
                      <button
                        className={styles.removeBtn}
                        onClick={() => handleRemove(item.courseId)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className={styles.footer}>
              <div className={styles.footerInfo}>
                <span className={styles.total}>총 {items.length}개 강의</span>
                <span className={styles.totalPrice}>
                  합계 <strong>{totalPrice.toLocaleString()}원</strong>
                </span>
              </div>
              <button
                className={styles.payBtn}
                onClick={handlePayment}
                disabled={paying}
              >
                {paying ? "결제 중..." : `${totalPrice.toLocaleString()}원 결제하기`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
