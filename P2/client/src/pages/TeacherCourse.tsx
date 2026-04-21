import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getTeacherCourses } from "../api/CourseApi"
import type { CourseListItem } from "../types/course/CourseListItem"
import CourseCard from "../components/course/CourseCard"
import styles from "./Courses.module.css"

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
                <CourseCard key={course.id} course={course} />
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
