import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getTeacherCourses } from "../api/CourseApi"
import type { CourseListItem } from "../types/course/CourseListItem"
import styles from "./Courses.module.css"
import cardStyles from "./TeacherCourse.module.css"

const CATEGORY_EMOJI: Record<string, string> = {
  KOREAN: "🍚",
  JAPANESE: "🍱",
  CHINESE: "🥢",
  WESTERN: "🍝",
  BAKING: "🍰",
  SIDE_DISH: "🥗",
  ONE_DISH: "🍲",
}

const DIFFICULTY_COLOR: Record<string, string> = {
  HIGH: "#e74c3c",
  MEDIUM: "#FFA500",
  LOW: "#27ae60",
}

export default function TeacherCourses() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<CourseListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      setError("")
      try {
        const { data } = await getTeacherCourses()
        const list: CourseListItem[] = Array.isArray(data)
          ? data
          : ((data as any)?.data ?? [])
        setCourses(list)
      } catch {
        setError("강의 목록을 불러오는 데 실패했습니다.")
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1 className={styles.title}>내 강의 관리</h1>
          <p className={styles.desc}>내가 만든 강의 목록입니다</p>
        </div>

        <div className={styles.content}>
          <div className={styles.resultBar}>
            <span className={styles.resultCount}>
              {loading ? "불러오는 중..." : `강의 ${courses.length}개`}
            </span>
            <button
              className={styles.loadMoreBtn}
              onClick={() => navigate("/courses/create")}
            >
              + 새 강의 만들기
            </button>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {!loading && courses.length === 0 && !error ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>📝</span>
              <p>아직 만든 강의가 없습니다</p>
              <button
                className={styles.emptyReset}
                onClick={() => navigate("/courses/create")}
              >
                첫 강의 만들기
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {courses.map((course) => (
                <div key={course.id} className={cardStyles.card}>
                  <div className={cardStyles.thumbnail}>
                    <span className={cardStyles.emoji}>
                      {CATEGORY_EMOJI[course.category] ?? "🍽️"}
                    </span>
                    <span className={cardStyles.category}>{course.category}</span>
                  </div>
                  <div className={cardStyles.body}>
                    <div className={cardStyles.meta}>
                      <span
                        className={cardStyles.difficulty}
                        style={{ color: DIFFICULTY_COLOR[course.difficulty] ?? "#999" }}
                      >
                        ● 난이도 {course.difficulty}
                      </span>
                      <span className={cardStyles.videoCount}>
                        📹 {course.videoCount}강
                      </span>
                    </div>
                    <div className={cardStyles.tools}>
                      {course.requiredTools?.slice(0, 3).map((t) => (
                        <span key={t} className={cardStyles.tool}>{t}</span>
                      ))}
                      {course.requiredTools?.length > 3 && (
                        <span className={cardStyles.tool}>
                          +{course.requiredTools.length - 3}
                        </span>
                      )}
                    </div>
                    <div className={cardStyles.price}>
                      {course.price === 0 ? "무료" : `${course.price.toLocaleString()}원`}
                    </div>
                  </div>
                  <div className={cardStyles.actions}>
                    <button
                      className={cardStyles.editBtn}
                      onClick={() => navigate(`/teacher/edit/${course.id}`)}
                    >
                      ✏️ 수정
                    </button>
                    <button
                      className={cardStyles.previewBtn}
                      onClick={() => navigate(`/courses/${course.id}`)}
                    >
                      👁 미리보기
                    </button>
                    <button
                      className={cardStyles.videoBtn}
                      onClick={() => navigate(`/videos/register/${course.id}`)}
                    >
                      + 영상
                    </button>
                  </div>
                </div>
              ))}
              {loading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={styles.skeleton} />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
