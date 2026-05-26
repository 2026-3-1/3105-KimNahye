import { useState, useEffect } from "react"
import { getMyCourses } from "../api/CourseApi"
import type { CourseListItem } from "../types/course/CourseListItem"
import CourseCard from "../components/course/CourseCard"
import styles from "./Courses.module.css"

export default function MyCourses() {
  const [courses, setCourses] = useState<CourseListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      setError("")
      try {
        const { data } = await getMyCourses()
        const list: CourseListItem[] = Array.isArray(data)
          ? data
          : ((data as any)?.data ?? [])
        setCourses(list)
      } catch {
        setError("수강 중인 강의를 불러오는 데 실패했습니다.")
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
          <h1 className={styles.title}>내 강의</h1>
          <p className={styles.desc}>수강 신청한 강의 목록입니다</p>
        </div>

        <section className={styles.content}>
          <div className={styles.resultBar}>
            <span className={styles.resultCount}>
              {loading && courses.length === 0
                ? "불러오는 중..."
                : `강의 ${courses.length}개`}
            </span>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {!loading && courses.length === 0 && !error ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>📚</span>
              <p>아직 수강 중인 강의가 없습니다</p>
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
        </section>
      </div>
    </div>
  )
}
