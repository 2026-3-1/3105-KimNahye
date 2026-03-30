import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createCourse } from "../api/CourseApi"
import type { CreateCourseRequest } from "../types/course/CreateCourseRequest"
import type { AxiosError } from "axios"
import styles from "../pages/CreateCourse.module.css"

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

const DIFFICULTY_OPTIONS: {
  value: Difficulty
  label: string
  color: string
}[] = [
  { value: "LOW", label: "하", color: "#27ae60" },
  { value: "MEDIUM", label: "중", color: "#FFA500" },
  { value: "HIGH", label: "상", color: "#e74c3c" },
]

const TOOLS_OPTIONS = [
  "knife",
  "pan",
  "pot",
  "oven",
  "wok",
  "blender",
  "bowl",
  "spatula",
]

export default function CreateCourse() {
  const navigate = useNavigate()

  const [category, setCategory] = useState<Category | "">("")
  const [difficulty, setDifficulty] = useState<Difficulty | "">("")
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [customTool, setCustomTool] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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
    if (!category || !difficulty) return
    setLoading(true)
    setError("")
    try {
      const payload: CreateCourseRequest = {
        category,
        difficulty,
        requiredTools: selectedTools,
      }
      const { data } = await createCourse(payload)
      const result = (data as any)?.data ?? data
      navigate(`/courses/${result.id}`)
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>
      setError(
        axiosError.response?.data?.message ?? "강의 생성에 실패했습니다.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1 className={styles.title}>강의 생성</h1>
          <p className={styles.desc}>새 강의를 만들고 영상을 등록해보세요</p>
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
                      ? {
                          borderColor: d.color,
                          color: d.color,
                          background: `${d.color}15`,
                        }
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
                    <button
                      className={styles.removeToolBtn}
                      onClick={() => handleToolToggle(t)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={!category || !difficulty || loading}
          >
            {loading ? "생성 중..." : "강의 생성하기"}
          </button>
        </div>
      </div>
    </div>
  )
}
