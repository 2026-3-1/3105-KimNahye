import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk"
import { getCourse } from "../api/CourseApi"
import { enrollCourse } from "../api/EnrollmentApi"
import { addToCart } from "../api/CartApi"
import { getCourseReviews, createReview, updateReview, deleteReview } from "../api/ReviewApi"
import useAuthStore from "../store/AuthStore"
import type { CourseDetail } from "../types/course/CourseDetail"
import type { AxiosError } from "axios"
import styles from "./CourseDetail.module.css"

const CATEGORY_EMOJI: Record<string, string> = {
  한식: "🍚",
  양식: "🍝",
  중식: "🥢",
  일식: "🍱",
  디저트: "🍰",
  기타: "🍽️",
}

const DIFFICULTY_COLOR: Record<string, string> = {
  상: "#e74c3c",
  중: "#FFA500",
  하: "#27ae60",
}

interface Review {
  id: string
  userId: string
  userNickname: string
  rating: number
  content: string
  createdAt: string
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}분 ${s > 0 ? `${s}초` : ""}`.trim()
}

function StarRating({ rating, onSelect }: { rating: number; onSelect?: (r: number) => void }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{ cursor: onSelect ? "pointer" : "default", color: star <= rating ? "#f5a623" : "#ddd", fontSize: "1.2rem" }}
          onClick={() => onSelect?.(star)}
        >
          ★
        </span>
      ))}
    </span>
  )
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()

  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [enrolling, setEnrolling] = useState(false)
  const [enrollSuccess, setEnrollSuccess] = useState(false)
  const [enrollError, setEnrollError] = useState<string>("")
  const [activeVideo, setActiveVideo] = useState<number>(0)
  const [cartAdding, setCartAdding] = useState(false)
  const [cartMsg, setCartMsg] = useState("")
  const [paying, setPaying] = useState(false)

  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewContent, setReviewContent] = useState("")
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState("")

  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [editRating, setEditRating] = useState(5)
  const [editContent, setEditContent] = useState("")
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState("")

  useEffect(() => {
    if (!id) return
    const fetch = async () => {
      setLoading(true)
      setError("")
      try {
        const { data } = await getCourse(id)
        const detail: CourseDetail = (data as any)?.data ?? data
        setCourse(detail)
      } catch {
        setError("강의 정보를 불러오는 데 실패했습니다.")
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  useEffect(() => {
    if (!id) return
    getCourseReviews(id)
      .then(({ data }) => {
        const list = (data as any)?.data ?? data
        setReviews(Array.isArray(list) ? list : [])
      })
      .catch(() => {})
  }, [id])

  const handleEnroll = async () => {
    if (!isAuthenticated) { navigate("/login"); return }
    if (!id) return
    setEnrolling(true)
    setEnrollError("")
    try {
      await enrollCourse(id)
      setEnrollSuccess(true)
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>
      setEnrollError(axiosError.response?.data?.message ?? "수강 신청에 실패했습니다.")
    } finally {
      setEnrolling(false)
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate("/login"); return }
    if (!id) return
    setCartAdding(true)
    setCartMsg("")
    try {
      await addToCart(id)
      setCartMsg("장바구니에 추가되었습니다!")
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>
      setCartMsg(axiosError.response?.data?.message ?? "장바구니 추가 실패")
    } finally {
      setCartAdding(false)
    }
  }

  const handlePayment = async () => {
    if (!isAuthenticated) { navigate("/login"); return }
    if (!id || !course) return
    setPaying(true)
    try {
      const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY as string
      const tossPayments = await loadTossPayments(clientKey)
      const payment = tossPayments.payment({ customerKey: user?.id ?? ANONYMOUS })
      sessionStorage.setItem("pendingCourseId", id)
      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: course.price },
        orderId: `${id}_${Date.now()}`,
        orderName: `${course.teacher.name} 셰프의 ${course.category} 클래스`,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      })
    } catch {
      sessionStorage.removeItem("pendingCourseId")
    } finally {
      setPaying(false)
    }
  }

  const handleReviewSubmit = async () => {
    if (!isAuthenticated) { navigate("/login"); return }
    if (!id) return
    setReviewSubmitting(true)
    setReviewError("")
    try {
      const { data } = await createReview(id, reviewRating, reviewContent)
      const review = (data as any)?.data ?? data
      setReviews((prev) => [review, ...prev])
      setReviewContent("")
      setReviewRating(5)
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>
      setReviewError(axiosError.response?.data?.message ?? "리뷰 작성에 실패했습니다.")
    } finally {
      setReviewSubmitting(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!id) return
    try {
      await deleteReview(id, reviewId)
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
    } catch {
      alert("리뷰 삭제에 실패했습니다.")
    }
  }

  const handleStartEdit = (review: Review) => {
    setEditingReviewId(review.id)
    setEditRating(review.rating)
    setEditContent(review.content)
    setEditError("")
  }

  const handleCancelEdit = () => {
    setEditingReviewId(null)
    setEditError("")
  }

  const handleSaveEdit = async (reviewId: string) => {
    if (!id) return
    if (!editContent.trim()) {
      setEditError("리뷰 내용을 입력하세요.")
      return
    }
    setEditSubmitting(true)
    setEditError("")
    try {
      const { data } = await updateReview(id, reviewId, editRating, editContent)
      const updated = (data as any)?.data ?? data
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, ...updated } : r)),
      )
      setEditingReviewId(null)
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>
      setEditError(
        axiosError.response?.data?.message ?? "리뷰 수정에 실패했습니다.",
      )
    } finally {
      setEditSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.skeletonHero} />
          <div className={styles.skeletonBody}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skeletonLine} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.errorBox}>
            <span>😢</span>
            <p>{error || "강의를 찾을 수 없습니다."}</p>
            <button className={styles.backBtn} onClick={() => navigate("/courses")}>
              강의 목록으로
            </button>
          </div>
        </div>
      </div>
    )
  }

  const totalDuration = course.videos.reduce((acc, v) => acc + v.duration, 0)
  const isTeacher = user?.role === "teacher"
  const isOwner = isTeacher && user?.id === course.teacher.id
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <nav className={styles.breadcrumb}>
          <button onClick={() => navigate("/courses")} className={styles.breadcrumbLink}>강의 탐색</button>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>{course.category}</span>
        </nav>

        <div className={styles.layout}>
          <main className={styles.main}>
            <div className={styles.hero}>
              <div className={styles.heroEmoji}>{CATEGORY_EMOJI[course.category] ?? "🍽️"}</div>
              <div className={styles.heroInfo}>
                <div className={styles.heroTags}>
                  <span className={styles.categoryTag}>{course.category}</span>
                  <span className={styles.difficultyTag} style={{ color: DIFFICULTY_COLOR[course.difficulty] ?? "#999" }}>
                    ● 난이도 {course.difficulty}
                  </span>
                </div>
                <h1 className={styles.heroTitle}>{course.teacher.name} 셰프의 {course.category} 클래스</h1>
                <div className={styles.heroMeta}>
                  <span>📹 총 {course.videoCount}강</span>
                  <span>⏱ {formatDuration(totalDuration)}</span>
                  <span>📅 {new Date(course.createdAt).toLocaleDateString("ko-KR")}</span>
                  {avgRating && <span>⭐ {avgRating} ({reviews.length}개 리뷰)</span>}
                </div>
              </div>
            </div>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>필요 도구</h2>
              <div className={styles.toolList}>
                {course.requiredTools.map((tool) => (
                  <span key={tool} className={styles.toolChip}>🔪 {tool}</span>
                ))}
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>커리큘럼</h2>
              <div className={styles.videoList}>
                {course.videos.map((video, idx) => (
                  <button
                    key={video.id}
                    className={`${styles.videoItem} ${activeVideo === idx ? styles.videoItemActive : ""}`}
                    onClick={() => { setActiveVideo(idx); navigate(`/videos/${video.id}`) }}
                  >
                    <span className={styles.videoIndex}>{idx + 1}</span>
                    <span className={styles.videoTitle}>{video.title}</span>
                    <span className={styles.videoDuration}>{formatDuration(video.duration)}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 리뷰 섹션 */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>수강생 리뷰 ({reviews.length})</h2>

              {isAuthenticated && !isTeacher && (
                <div className={styles.reviewForm}>
                  <div className={styles.reviewFormRow}>
                    <StarRating rating={reviewRating} onSelect={setReviewRating} />
                  </div>
                  <textarea
                    className={styles.reviewTextarea}
                    placeholder="리뷰를 작성하세요 (영상 1개 이상 수강 완료 후 작성 가능합니다)"
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    rows={3}
                  />
                  {reviewError && <p className={styles.reviewError}>{reviewError}</p>}
                  <button
                    className={styles.reviewSubmitBtn}
                    onClick={handleReviewSubmit}
                    disabled={reviewSubmitting || !reviewContent.trim()}
                  >
                    {reviewSubmitting ? "제출 중..." : "리뷰 작성"}
                  </button>
                </div>
              )}

              <div className={styles.reviewList}>
                {reviews.length === 0 ? (
                  <p className={styles.noReview}>아직 리뷰가 없습니다.</p>
                ) : (
                  reviews.map((review) => {
                    const isEditing = editingReviewId === review.id
                    const isMine = user?.id === review.userId
                    return (
                      <div key={review.id} className={styles.reviewItem}>
                        <div className={styles.reviewHeader}>
                          <span className={styles.reviewNickname}>{review.userNickname}</span>
                          <StarRating
                            rating={isEditing ? editRating : review.rating}
                            onSelect={isEditing ? setEditRating : undefined}
                          />
                          <span className={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString("ko-KR")}</span>
                          {isMine && !isEditing && (
                            <>
                              <button className={styles.reviewEditBtn} onClick={() => handleStartEdit(review)}>수정</button>
                              <button className={styles.reviewDeleteBtn} onClick={() => handleDeleteReview(review.id)}>삭제</button>
                            </>
                          )}
                        </div>
                        {isEditing ? (
                          <div className={styles.reviewEditForm}>
                            <textarea
                              className={styles.reviewTextarea}
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              rows={3}
                            />
                            {editError && <p className={styles.reviewError}>{editError}</p>}
                            <div className={styles.reviewEditActions}>
                              <button
                                className={styles.reviewSubmitBtn}
                                onClick={() => handleSaveEdit(review.id)}
                                disabled={editSubmitting || !editContent.trim()}
                              >
                                {editSubmitting ? "저장 중..." : "저장"}
                              </button>
                              <button
                                className={styles.reviewCancelBtn}
                                onClick={handleCancelEdit}
                                disabled={editSubmitting}
                              >
                                취소
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className={styles.reviewContent}>{review.content}</p>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </section>
          </main>

          <aside className={styles.sidebar}>
            <div className={styles.enrollCard}>
              <div className={styles.enrollCardTop}>
                <span className={styles.enrollEmoji}>{CATEGORY_EMOJI[course.category] ?? "🍽️"}</span>
                <div className={styles.enrollStats}>
                  <div className={styles.enrollStat}>
                    <span className={styles.enrollStatLabel}>강의 수</span>
                    <span className={styles.enrollStatValue}>{course.videoCount}강</span>
                  </div>
                  <div className={styles.enrollStat}>
                    <span className={styles.enrollStatLabel}>총 시간</span>
                    <span className={styles.enrollStatValue}>{formatDuration(totalDuration)}</span>
                  </div>
                  <div className={styles.enrollStat}>
                    <span className={styles.enrollStatLabel}>난이도</span>
                    <span className={styles.enrollStatValue} style={{ color: DIFFICULTY_COLOR[course.difficulty] }}>
                      {course.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              {enrollError && <p className={styles.enrollError}>{enrollError}</p>}
              {cartMsg && <p className={styles.cartMsg}>{cartMsg}</p>}

              {isOwner ? (
                <div>
                  <div className={styles.previewBadge}>👁 강사 미리보기 모드</div>
                  <button className={styles.addVideoBtn} onClick={() => navigate(`/videos/register/${id}`)}>
                    + 영상 등록
                  </button>
                  <button className={styles.editCourseBtn} onClick={() => navigate(`/teacher/edit/${id}`)}>
                    ✏️ 강의 수정
                  </button>
                </div>
              ) : enrollSuccess ? (
                <div className={styles.enrollDone}>✅ 수강 신청 완료!</div>
              ) : (
                <>
                  <div className={styles.priceTag}>
                    {course.price === 0 ? "무료" : `${course.price.toLocaleString()}원`}
                  </div>
                  {course.price === 0 ? (
                    <button className={styles.enrollBtn} onClick={handleEnroll} disabled={enrolling}>
                      {enrolling ? "신청 중..." : "무료 수강신청"}
                    </button>
                  ) : (
                    <>
                      <button className={styles.payBtn} onClick={handlePayment} disabled={paying}>
                        {paying ? "결제 중..." : "💳 결제하기"}
                      </button>
                      <button className={styles.cartBtn} onClick={handleAddToCart} disabled={cartAdding}>
                        {cartAdding ? "담는 중..." : "🛒 장바구니 담기"}
                      </button>
                    </>
                  )}
                </>
              )}

              <div className={styles.teacherInfo}>
                <span className={styles.teacherAvatar}>{course.teacher.name[0]}</span>
                <div>
                  <p className={styles.teacherLabel}>강의 선생님</p>
                  <p className={styles.teacherName}>👨‍🍳 {course.teacher.name}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
