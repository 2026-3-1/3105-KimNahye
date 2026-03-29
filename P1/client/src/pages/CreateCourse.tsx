import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createCourse } from "../api/CourseApi"
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

  // Step 1: 유튜브 영상 등록
  const [youtubeId, setYoutubeId] = useState("")
  const [videoId, setVideoId] = useState<string | null>(null)
  const [videoTitle, setVideoTitle] = useState<string>("")
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoError, setVideoError] = useState("")

  // Step 2: 강의 정보
  const [category, setCategory] = useState<Category | "">("")
  const [difficulty, setDifficulty] = useState<Difficulty | "">("")
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [customTool, setCustomTool] = useState("")

  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const step = videoId ? 2 : 1

  // ── Step 1: 영상 등록 ──────────────────────────────────────
  const handleRegisterVideo = async () => {
    if (!youtubeId.trim()) return
    setVideoLoading(true)
    setVideoError("")
    try {
      const { data } = await registerVideo(youtubeId.trim())
      const result = (data as any)?.data ?? data
      setVideoId(result.id)
      setVideoTitle(result.title)
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>
      setVideoError(
        axiosError.response?.data?.message ?? "영상 등록에 실패했습니다.",
      )
    } finally {
      setVideoLoading(false)
    }
  }

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

  // ── Step 2: 강의 생성 ──────────────────────────────────────
  const handleSubmit = async () => {
    if (!videoId || !category || !difficulty) return
    setSubmitLoading(true)
    setSubmitError("")
    try {
      const payload: CreateCourseRequest = {
        video_id: videoId,
        category,
        difficulty,
        requiredTools: selectedTools,
      }
      const { data } = await createCourse(payload)
      const result = (data as any)?.data ?? data
      navigate(`/courses/${result.id}`)
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>
      setSubmitError(
        axiosError.response?.data?.message ?? "강의 생성에 실패했습니다.",
      )
    } finally {
      setSubmitLoading(false)
    }
  }

  const canSubmit = !!videoId && !!category && !!difficulty

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* 헤더 */}
        <div className={styles.header}>
          <h1 className={styles.title}>강의 등록</h1>
          <p className={styles.desc}>유튜브 영상으로 새 강의를 만들어보세요</p>
        </div>

        {/* 스텝 인디케이터 */}
        <div className={styles.steps}>
          <div
            className={`${styles.step} ${step >= 1 ? styles.stepActive : ""}`}
          >
            <span className={styles.stepNum}>1</span>
            <span className={styles.stepLabel}>영상 등록</span>
          </div>
          <div
            className={`${styles.stepLine} ${step >= 2 ? styles.stepLineDone : ""}`}
          />
          <div
            className={`${styles.step} ${step >= 2 ? styles.stepActive : ""}`}
          >
            <span className={styles.stepNum}>2</span>
            <span className={styles.stepLabel}>강의 정보</span>
          </div>
        </div>

        {/* ── Step 1 ── */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span className={styles.cardTitleNum}>01</span>
            유튜브 영상 등록
          </h2>

          {videoId ? (
            <div className={styles.videoPreview}>
              <img
                src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                alt={videoTitle}
                className={styles.videoThumb}
              />
              <div className={styles.videoPreviewInfo}>
                <p className={styles.videoPreviewTitle}>{videoTitle}</p>
                <p className={styles.videoPreviewId}>ID: {youtubeId}</p>
                <button
                  className={styles.resetVideoBtn}
                  onClick={() => {
                    setVideoId(null)
                    setVideoTitle("")
                    setYoutubeId("")
                  }}
                >
                  다시 선택
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className={styles.fieldLabel}>YouTube Video ID</p>
              <div className={styles.videoInputRow}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="예: eU6VoHNUT1M"
                  value={youtubeId}
                  onChange={(e) => setYoutubeId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRegisterVideo()}
                />
                <button
                  className={styles.registerBtn}
                  onClick={handleRegisterVideo}
                  disabled={videoLoading || !youtubeId.trim()}
                >
                  {videoLoading ? "등록 중..." : "영상 확인"}
                </button>
              </div>
              <p className={styles.hint}>
                유튜브 URL에서 <code>v=</code> 뒤의 값을 입력하세요
              </p>
              {videoError && <p className={styles.errorMsg}>{videoError}</p>}
            </>
          )}
        </div>

        {/* ── Step 2 ── */}
        <div
          className={`${styles.card} ${!videoId ? styles.cardDisabled : ""}`}
        >
          <h2 className={styles.cardTitle}>
            <span className={styles.cardTitleNum}>02</span>
            강의 정보 입력
          </h2>

          {/* 카테고리 */}
          <div className={styles.fieldGroup}>
            <p className={styles.fieldLabel}>
              카테고리 <span className={styles.required}>*</span>
            </p>
            <div className={styles.optionGrid}>
              {CATEGORY_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  disabled={!videoId}
                  className={`${styles.optionBtn} ${category === c.value ? styles.optionBtnActive : ""}`}
                  onClick={() => setCategory(c.value)}
                >
                  <span className={styles.optionEmoji}>{c.emoji}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 난이도 */}
          <div className={styles.fieldGroup}>
            <p className={styles.fieldLabel}>
              난이도 <span className={styles.required}>*</span>
            </p>
            <div className={styles.difficultyRow}>
              {DIFFICULTY_OPTIONS.map((d) => (
                <button
                  key={d.value}
                  disabled={!videoId}
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

          {/* 필요 도구 */}
          <div className={styles.fieldGroup}>
            <p className={styles.fieldLabel}>필요 도구</p>
            <div className={styles.toolChips}>
              {TOOLS_OPTIONS.map((tool) => (
                <button
                  key={tool}
                  disabled={!videoId}
                  className={`${styles.chip} ${selectedTools.includes(tool) ? styles.chipActive : ""}`}
                  onClick={() => handleToolToggle(tool)}
                >
                  {tool}
                </button>
              ))}
            </div>
            {/* 직접 입력 */}
            <div className={styles.customToolRow}>
              <input
                type="text"
                className={styles.input}
                placeholder="직접 입력"
                value={customTool}
                disabled={!videoId}
                onChange={(e) => setCustomTool(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCustomTool()}
              />
              <button
                className={styles.addToolBtn}
                disabled={!videoId || !customTool.trim()}
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

          {submitError && <p className={styles.errorMsg}>{submitError}</p>}

          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={!canSubmit || submitLoading}
          >
            {submitLoading ? "등록 중..." : "강의 등록하기"}
          </button>
        </div>
      </div>
    </div>
  )
}
