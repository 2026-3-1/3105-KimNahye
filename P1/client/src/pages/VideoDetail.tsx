import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getVideo } from "../api/VideoApi"
import type { VideoDetail } from "../types/video/VideoDetail"
import type { AxiosError } from "axios"
import styles from "./VideoDetail.module.css"

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}분 ${s > 0 ? `${s}초` : ""}`.trim()
}

export default function VideoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [video, setVideo] = useState<VideoDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (!id) return
    const fetch = async () => {
      setLoading(true)
      setError("")
      try {
        const { data } = await getVideo(id)
        const detail: VideoDetail = (data as any)?.data ?? data
        setVideo(detail)
      } catch (err) {
        const axiosError = err as AxiosError<{ message: string }>
        setError(
          axiosError.response?.data?.message ??
            "영상 정보를 불러오는 데 실패했습니다.",
        )
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.skeletonPlayer} />
          <div className={styles.skeletonLines}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.skeletonLine} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !video) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.errorBox}>
            <span>😢</span>
            <p>{error || "영상을 찾을 수 없습니다."}</p>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
              돌아가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* 브레드크럼 */}
        <button className={styles.backLink} onClick={() => navigate(-1)}>
          ← 돌아가기
        </button>

        {/* 유튜브 플레이어 */}
        <div className={styles.playerWrap}>
          <iframe
            className={styles.player}
            src={`https://www.youtube.com/embed/${video.youtubeVideoId}`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* 영상 정보 */}
        <div className={styles.info}>
          <h1 className={styles.title}>{video.title}</h1>
          <div className={styles.meta}>
            <span className={styles.metaItem}>
              ⏱ {formatDuration(video.duration)}
            </span>
            <a
              className={styles.youtubeLink}
              href={`https://www.youtube.com/watch?v=${video.youtubeVideoId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              ▶ YouTube에서 보기
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
