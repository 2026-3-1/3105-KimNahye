import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { getCourses } from "../api/CourseApi"
import type { GetCoursesParams } from "../types/course/GetCourseParams"
import type { CourseListItem } from "../types/course/CourseListItem"
import CourseCard from "../components/course/CourseCard"
import styles from "./Courses.module.css"

const CATEGORIES = [
  "전체",
  "KOREAN",
  "JAPANESE",
  "CHINESE",
  "WESTERN",
  "BAKING",
  "SIDE_DISH",
  "ONE_DISH",
] as const
const DIFFICULTIES = ["전체", "HIGH", "MEDIUM", "LOW"] as const
const TOOLS_OPTIONS = ["knife", "pan", "pot", "oven", "wok", "blender"]
const LIMIT = 12

type Category =
  | "KOREAN"
  | "JAPANESE"
  | "CHINESE"
  | "WESTERN"
  | "BAKING"
  | "SIDE_DISH"
  | "ONE_DISH"
type Difficulty = "HIGH" | "MEDIUM" | "LOW"

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [courses, setCourses] = useState<CourseListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const [category, setCategory] = useState<string>(
    searchParams.get("category") ?? "전체",
  )
  const [difficulty, setDifficulty] = useState<string>(
    searchParams.get("difficulty") ?? "전체",
  )
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [maxDuration, setMaxDuration] = useState<string>("")

  const buildParams = useCallback(
    (currentPage: number): GetCoursesParams => {
      const params: GetCoursesParams = { page: currentPage, limit: LIMIT }
      if (category !== "전체") params.category = category as Category
      if (difficulty !== "전체") params.difficulty = difficulty as Difficulty
      if (selectedTools.length > 0) params.requiredTools = selectedTools
      if (maxDuration !== "") params.duration = Number(maxDuration)
      return params
    },
    [category, difficulty, selectedTools, maxDuration],
  )

  const fetchCourses = useCallback(
    async (currentPage: number, reset: boolean, signal?: AbortSignal) => {
      setLoading(true)
      setError("")
      try {
        const { data } = await getCourses(buildParams(currentPage), signal)
        const list: CourseListItem[] = Array.isArray(data)
          ? data
          : ((data as any)?.data ?? [])
        setCourses((prev) => (reset ? list : [...prev, ...list]))
        setHasMore(list.length === LIMIT)
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return
        setError("강의 목록을 불러오는 데 실패했습니다.")
      } finally {
        setLoading(false)
      }
    },
    [buildParams],
  )

  useEffect(() => {
    const controller = new AbortController()
    setPage(1)
    fetchCourses(1, true, controller.signal)
    return () => controller.abort()
  }, [category, difficulty, selectedTools, maxDuration])

  useEffect(() => {
    const params: Record<string, string> = {}
    if (category !== "전체") params.category = category
    if (difficulty !== "전체") params.difficulty = difficulty
    setSearchParams(params, { replace: true })
  }, [category, difficulty])

  const handleToolToggle = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool],
    )
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchCourses(nextPage, false)
  }

  const handleReset = () => {
    setCategory("전체")
    setDifficulty("전체")
    setSelectedTools([])
    setMaxDuration("")
  }

  const isFiltered =
    category !== "전체" ||
    difficulty !== "전체" ||
    selectedTools.length > 0 ||
    maxDuration !== ""

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* 헤더 */}
        <div className={styles.header}>
          <h1 className={styles.title}>강의 탐색</h1>
          <p className={styles.desc}>
            원하는 조건으로 필터링해 딱 맞는 강의를 찾아보세요
          </p>
        </div>

        <div className={styles.layout}>
          {/* 필터 사이드바 */}
          <aside className={styles.sidebar}>
            <div className={styles.filterHeader}>
              <span className={styles.filterTitle}>필터</span>
              {isFiltered && (
                <button className={styles.resetBtn} onClick={handleReset}>
                  초기화
                </button>
              )}
            </div>

            {/* 카테고리 */}
            <div className={styles.filterGroup}>
              <p className={styles.filterLabel}>카테고리</p>
              <div className={styles.filterChips}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`${styles.chip} ${category === cat ? styles.chipActive : ""}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 난이도 */}
            <div className={styles.filterGroup}>
              <p className={styles.filterLabel}>난이도</p>
              <div className={styles.filterChips}>
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    className={`${styles.chip} ${difficulty === d ? styles.chipActive : ""}`}
                    onClick={() => setDifficulty(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* 도구 */}
            <div className={styles.filterGroup}>
              <p className={styles.filterLabel}>보유 도구</p>
              <div className={styles.filterChips}>
                {TOOLS_OPTIONS.map((tool) => (
                  <button
                    key={tool}
                    className={`${styles.chip} ${selectedTools.includes(tool) ? styles.chipActive : ""}`}
                    onClick={() => handleToolToggle(tool)}
                  >
                    {tool}
                  </button>
                ))}
              </div>
            </div>

            {/* 최대 영상 시간 */}
            <div className={styles.filterGroup}>
              <p className={styles.filterLabel}>최대 영상 길이 (초)</p>
              <input
                type="number"
                className={styles.durationInput}
                placeholder="예: 600"
                value={maxDuration}
                min={0}
                onChange={(e) => setMaxDuration(e.target.value)}
              />
            </div>
          </aside>

          {/* 강의 목록 */}
          <section className={styles.content}>
            {/* 결과 요약 */}
            <div className={styles.resultBar}>
              <span className={styles.resultCount}>
                {loading && courses.length === 0
                  ? "불러오는 중..."
                  : `강의 ${courses.length}개`}
              </span>
            </div>

            {/* 에러 */}
            {error && <div className={styles.error}>{error}</div>}

            {/* 강의 카드 그리드 */}
            {!loading && courses.length === 0 && !error ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>🔍</span>
                <p>조건에 맞는 강의가 없습니다</p>
                <button className={styles.emptyReset} onClick={handleReset}>
                  필터 초기화
                </button>
              </div>
            ) : (
              <div className={styles.grid}>
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
                {/* 스켈레톤 */}
                {loading &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={styles.skeleton} />
                  ))}
              </div>
            )}

            {/* 더 보기 */}
            {!loading && hasMore && courses.length > 0 && (
              <div className={styles.loadMoreWrap}>
                <button className={styles.loadMoreBtn} onClick={handleLoadMore}>
                  더 보기
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
