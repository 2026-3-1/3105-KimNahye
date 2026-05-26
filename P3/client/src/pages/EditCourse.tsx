import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getCourse, updateCourse } from "../api/CourseApi"
import type { CreateCourseRequest } from "../types/course/CreateCourseRequest"
import type { AxiosError } from "axios"
import styles from "./CreateCourse.module.css"

type Category = CreateCourseRequest["category"]
type Difficulty = CreateCourseRequest["difficulty"]

const CATEGORY_OPTIONS: { value: Category; label: string; emoji: string }[] = [
  { value: "KOREAN", label: "한식", emoji: "🍚" },
  { value: "JAPANESE", label: "일식", emoji: "🍱" },
  { value: "CHINESE", label: "중식", emoji: "🥢" },
  { value: "WESTERN", label: "양식", emoji: "🍝" },
  { value: "BAKING", label: "베이킹", emoji: "🍰" },
  { value: "SIDE_DISH", label: "반찬", emoji: "🥗" },
  { value: "ONE_DISH", label: "일품", emoji: "🍲" },
]

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; color: string }[] = [
  { value: "LOW", label: "하", color: "#27ae60" },
  { value: "MEDIUM", label: "중", color: "#FFA500" },
  { value: "HIGH", label: "상", color: "#e74c3c" },
]

const TOOLS_OPTIONS = ["knife", "pan", "pot", "oven", "wok", "blender", "bowl", "spatula"]

export default function EditCourse() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [category, setCategory] = useState<Category | "">("")
  const [difficulty, setDifficulty] = useState<Difficulty | "">("")
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [customTool, setCustomTool] = useState("")
  const [price, setPrice] = useState<number>(0)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const { data } = await getCourse(id)
        const course = (data as any)?.data ?? data
        setCategory(course.category ?? "")
        setDifficulty(course.difficulty ?? "")
        setSelectedTools(course.requiredTools ?? [])
        setPrice(course.price ?? 0)
      } catch {
        setError("강의 정보를 불러오는 데 실패했습니다.")
      } finally {
        setFetchLoading(false)
      }
    }
    load()
  }, [id])

  const handleToolToggle = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool],
    )
  }

  const handleAddCustomTool = () => {
    const t = customTool.trim()
    if (!t || selectedTools.includes(t)) return
    setSelectedTools((prev) => [...prev, t])
    setCustomTool("")
  }

  const handleSubmit = async () => {
    if (!category || !difficulty || !id) return
    setLoading(true)
    setError("")
    try {
      await updateCourse(id, {
        category: category as Category,
        difficulty: difficulty as Difficulty,
        requiredTools: selectedTools,
        price,
      })
      navigate("/teacher")
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>
      setError(axiosError.response?.data?.message ?? "강의 수정에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <p>불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1 className={styles.title}>강의 수정</h1>
          <p className={styles.desc}>강의 정보를 수정하세요</p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span className={styles.cardTitleNum}>강의 정보</span>
          </h2>

          <div className={styles.fieldGroup}>
            <p className={styles.fieldLabel}>
              카테고리 <span className={styles.required}>*</span>
            </p>
            <div className={styles.optionGrid}>
              {CATEGORY_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  className={`${styles.optionBtn} ${category === c.value ? styles.optionBtnActive : ""}`}
                  onClick={() => setCategory(c.value)}
                >
                  <span className={styles.optionEmoji}>{c.emoji}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <p className={styles.fieldLabel}>
              난이도 <span className={styles.required}>*</span>
            </p>
            <div className={styles.difficultyRow}>
              {DIFFICULTY_OPTIONS.map((d) => (
                <button
                  key={d.value}
                  className={`${styles.diffBtn} ${difficulty === d.value ? styles.diffBtnActive : ""}`}
                  style={
                    difficulty === d.value
                      ? { borderColor: d.color, color: d.color, background: `${d.color}15` }
                      : {}
                  }
                  onClick={() => setDifficulty(d.value)}
                >
                  ● 난이도 {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <p className={styles.fieldLabel}>필요 도구</p>
            <div className={styles.toolChips}>
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
            <div className={styles.customToolRow}>
              <input
                type="text"
                className={styles.input}
                placeholder="직접 입력"
                value={customTool}
                onChange={(e) => setCustomTool(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCustomTool()}
              />
              <button
                className={styles.addToolBtn}
                disabled={!customTool.trim()}
                onClick={handleAddCustomTool}
              >
                추가
              </button>
            </div>
            {selectedTools.length > 0 && (
              <div className={styles.selectedTools}>
                {selectedTools.map((t) => (
                  <span key={t} className={styles.selectedTool}>
                    {t}
                    <button className={styles.removeToolBtn} onClick={() => handleToolToggle(t)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <p className={styles.fieldLabel}>수강료</p>
            <div className={styles.priceRow}>
              <button
                className={`${styles.diffBtn} ${price === 0 ? styles.diffBtnActive : ""}`}
                onClick={() => setPrice(0)}
              >
                무료
              </button>
              <button
                className={`${styles.diffBtn} ${price > 0 ? styles.diffBtnActive : ""}`}
                onClick={() => { if (price === 0) setPrice(10000) }}
              >
                유료
              </button>
              {price > 0 && (
                <input
                  type="number"
                  className={styles.input}
                  placeholder="금액 입력 (원)"
                  min={0}
                  step={1000}
                  value={price}
                  onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
                  style={{ flex: 1 }}
                />
              )}
            </div>
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              className={styles.submitBtn}
              style={{ background: "#888", flex: "0 0 auto", width: "auto", padding: "15px 24px" }}
              onClick={() => navigate("/teacher")}
              disabled={loading}
            >
              취소
            </button>
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={!category || !difficulty || loading}
            >
              {loading ? "저장 중..." : "수정 완료"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
