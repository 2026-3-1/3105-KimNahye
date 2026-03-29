import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getCourse } from "../api/CourseApi"
import { enrollCourse } from "../api/EnrollmentApi"
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

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}분 ${s > 0 ? `${s}초` : ""}`.trim()
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

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }
    if (!id) return
    setEnrolling(true)
    setEnrollError("")
    try {
      await enrollCourse(id)
      setEnrollSuccess(true)
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>
      setEnrollError(
        axiosError.response?.data?.message ?? "수강 신청에 실패했습니다.",
      )
    } finally {
      setEnrolling(false)
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
            <button
              className={styles.backBtn}
              onClick={() => navigate("/courses")}
            >
              강의 목록으로
            </button>
          </div>
        </div>
      </div>
    )
  }

  const totalDuration = course.videos.reduce((acc, v) => acc + v.duration, 0)
  const isTeacher = user?.role === "teacher"

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* 브레드크럼 */}
        <nav className={styles.breadcrumb}>
          <button
            onClick={() => navigate("/courses")}
            className={styles.breadcrumbLink}
          >
            강의 탐색
          </button>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>{course.category}</span>
        </nav>

        <div className={styles.layout}>
          {/* 메인 콘텐츠 */}
          <main className={styles.main}>
            {/* 히어로 */}
            <div className={styles.hero}>
              <div className={styles.heroEmoji}>
                {CATEGORY_EMOJI[course.category] ?? "🍽️"}
              </div>
              <div className={styles.heroInfo}>
                <div className={styles.heroTags}>
                  <span className={styles.categoryTag}>{course.category}</span>
                  <span
                    className={styles.difficultyTag}
                    style={{
                      color: DIFFICULTY_COLOR[course.difficulty] ?? "#999",
                    }}
                  >
                    ● 난이도 {course.difficulty}
                  </span>
                </div>
                <h1 className={styles.heroTitle}>
                  {course.teacher.name} 셰프의 {course.category} 클래스
                </h1>
                <div className={styles.heroMeta}>
                  <span>📹 총 {course.videoCount}강</span>
                  <span>⏱ {formatDuration(totalDuration)}</span>
                  <span>
                    📅 {new Date(course.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
              </div>
            </div>

            {/* 필요 도구 */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>필요 도구</h2>
              <div className={styles.toolList}>
                {course.requiredTools.map((tool) => (
                  <span key={tool} className={styles.toolChip}>
                    🔪 {tool}
                  </span>
                ))}
              </div>
            </section>

            {/* 커리큘럼 */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>커리큘럼</h2>
              <div className={styles.videoList}>
                {course.videos.map((video, idx) => (
                  <button
                    key={video.id}
                    className={`${styles.videoItem} ${activeVideo === idx ? styles.videoItemActive : ""}`}
                    onClick={() => setActiveVideo(idx)}
                  >
                    <span className={styles.videoIndex}>{idx + 1}</span>
                    <span className={styles.videoTitle}>{video.title}</span>
                    <span className={styles.videoDuration}>
                      {formatDuration(video.duration)}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </main>

          {/* 사이드 수강 신청 카드 */}
          <aside className={styles.sidebar}>
            <div className={styles.enrollCard}>
              <div className={styles.enrollCardTop}>
                <span className={styles.enrollEmoji}>
                  {CATEGORY_EMOJI[course.category] ?? "🍽️"}
                </span>
                <div className={styles.enrollStats}>
                  <div className={styles.enrollStat}>
                    <span className={styles.enrollStatLabel}>강의 수</span>
                    <span className={styles.enrollStatValue}>
                      {course.videoCount}강
                    </span>
                  </div>
                  <div className={styles.enrollStat}>
                    <span className={styles.enrollStatLabel}>총 시간</span>
                    <span className={styles.enrollStatValue}>
                      {formatDuration(totalDuration)}
                    </span>
                  </div>
                  <div className={styles.enrollStat}>
                    <span className={styles.enrollStatLabel}>난이도</span>
                    <span
                      className={styles.enrollStatValue}
                      style={{ color: DIFFICULTY_COLOR[course.difficulty] }}
                    >
                      {course.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              {enrollError && (
                <p className={styles.enrollError}>{enrollError}</p>
              )}

              {enrollSuccess ? (
                <div className={styles.enrollDone}>✅ 수강 신청 완료!</div>
              ) : isTeacher ? (
                <div className={styles.teacherNote}>
                  선생님 계정은 수강 신청을 할 수 없습니다.
                </div>
              ) : (
                <button
                  className={styles.enrollBtn}
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling
                    ? "신청 중..."
                    : isAuthenticated
                      ? "수강 신청하기"
                      : "로그인 후 수강 신청"}
                </button>
              )}

              <div className={styles.teacherInfo}>
                <span className={styles.teacherAvatar}>
                  {course.teacher.name[0]}
                </span>
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
