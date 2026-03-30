import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { registerVideo } from "../api/VideoApi"
import type { RegisterVideoRequest } from "../types/video/RegisterVideoRequest"
import type { AxiosError } from "axios"
import styles from "./Register.module.css"

type RegisteredVideo = {
  id: string
  title: string
  duration: number
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}분 ${s > 0 ? `${s}초` : ""}`.trim()
}

export default function RegisterVideo() {
  const navigate = useNavigate()
  const { courseId } = useParams<{ courseId: string }>()

  const [youtubeId, setYoutubeId] = useState("")
  const [title, setTitle] = useState("")
  const [duration, setDuration] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [registeredVideos, setRegisteredVideos] = useState<RegisteredVideo[]>(
    [],
  )

  const handleRegister = async () => {
    if (!courseId || !youtubeId.trim() || !title.trim() || !duration) return
    setLoading(true)
    setError("")
    try {
      const payload: RegisterVideoRequest = {
        youtubeVideoId: youtubeId.trim(),
        title: title.trim(),
        duration: Number(duration),
        courseId,
      }
      const { data } = await registerVideo(payload)
      const result = (data as any)?.data ?? data
      setRegisteredVideos((prev) => [
        ...prev,
        {
          id: result.id,
          title: title.trim(),
          duration: Number(duration),
        },
      ])
      // 입력 초기화
      setYoutubeId("")
      setTitle("")
      setDuration("")
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>
      setError(
        axiosError.response?.data?.message ?? "영상 등록에 실패했습니다.",
      )
    } finally {
      setLoading(false)
    }
  }

  const handleDone = () => {
    navigate(`/courses/${courseId}`)
  }

  if (!courseId) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.errorBox}>
            <span>😢</span>
            <p>강의 ID가 없습니다. 강의를 먼저 생성해주세요.</p>
            <button
              className={styles.backBtn}
              onClick={() => navigate("/courses/create")}
            >
              강의 생성하기
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
          <h1 className={styles.title}>영상 등록</h1>
          <p className={styles.desc}>
            강의에 영상을 추가하세요. 여러 개 등록할 수 있습니다.
          </p>
          <span className={styles.courseIdBadge}>강의 ID: {courseId}</span>
        </div>

        {/* 등록된 영상 목록 */}
        {registeredVideos.length > 0 && (
          <div className={styles.registeredList}>
            <p className={styles.registeredTitle}>
              등록된 영상 ({registeredVideos.length}개)
            </p>
            {registeredVideos.map((v, idx) => (
              <div key={v.id} className={styles.registeredItem}>
                <span className={styles.registeredIndex}>{idx + 1}</span>
                <span className={styles.registeredVideoTitle}>{v.title}</span>
                <span className={styles.registeredDuration}>
                  {formatDuration(v.duration)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 영상 입력 폼 */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>영상 정보 입력</h2>

          <div className={styles.fieldGroup}>
            <p className={styles.fieldLabel}>
              YouTube Video ID <span className={styles.required}>*</span>
            </p>
            <input
              type="text"
              className={styles.input}
              placeholder="예: eU6VoHNUT1M"
              value={youtubeId}
              onChange={(e) => setYoutubeId(e.target.value)}
            />
            <p className={styles.hint}>
              유튜브 URL에서 <code>v=</code> 뒤의 값을 입력하세요
            </p>
          </div>

          <div className={styles.fieldGroup}>
            <p className={styles.fieldLabel}>
              영상 제목 <span className={styles.required}>*</span>
            </p>
            <input
              type="text"
              className={styles.input}
              placeholder="영상 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <p className={styles.fieldLabel}>
              영상 길이 (초) <span className={styles.required}>*</span>
            </p>
            <input
              type="number"
              className={styles.input}
              placeholder="예: 123"
              value={duration}
              min={1}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <button
            className={styles.registerBtn}
            onClick={handleRegister}
            disabled={
              loading || !youtubeId.trim() || !title.trim() || !duration
            }
          >
            {loading ? "등록 중..." : "+ 영상 추가"}
          </button>
        </div>

        {/* 완료 버튼 */}
        <button
          className={styles.doneBtn}
          onClick={handleDone}
          disabled={registeredVideos.length === 0}
        >
          완료 — 강의 상세 보기
        </button>
      </div>
    </div>
  )
}
