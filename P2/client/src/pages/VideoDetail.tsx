import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getVideo } from "../api/VideoApi"
import { updateProgress, getProgress } from "../api/WatchLogApi"
import { getBookmarks, addBookmark, deleteBookmark } from "../api/BookmarkApi"
import useAuthStore from "../store/AuthStore"
import type { VideoDetail } from "../types/video/VideoDetail"
import type { AxiosError } from "axios"
import styles from "./VideoDetail.module.css"

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}분 ${s > 0 ? `${s}초` : ""}`.trim()
}

function formatSec(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

interface Bookmark {
  id: string
  videoId: string
  positionSec: number
  note: string | null
  createdAt: string
}

export default function VideoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [video, setVideo] = useState<VideoDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  const [watchedDuration, setWatchedDuration] = useState(0)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [bookmarkNote, setBookmarkNote] = useState("")
  const [showBookmarkPanel, setShowBookmarkPanel] = useState(false)

  const playerRef = useRef<HTMLIFrameElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
        setError(axiosError.response?.data?.message ?? "영상 정보를 불러오는 데 실패했습니다.")
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  // 이어보기: 시청 위치 조회
  useEffect(() => {
    if (!id || !isAuthenticated) return
    getProgress(id)
      .then(({ data }) => {
        const progress = (data as any)?.data ?? data
        if (progress?.watchedDuration > 0) {
          setWatchedDuration(progress.watchedDuration)
        }
      })
      .catch(() => {})
  }, [id, isAuthenticated])

  // 북마크 목록 조회
  useEffect(() => {
    if (!id || !isAuthenticated) return
    getBookmarks(id)
      .then(({ data }) => {
        const list = (data as any)?.data ?? data
        setBookmarks(Array.isArray(list) ? list : [])
      })
      .catch(() => {})
  }, [id, isAuthenticated])

  // 30초마다 progress 저장 (간이 구현: 카운터 기반)
  const progressRef = useRef(watchedDuration)
  useEffect(() => {
    progressRef.current = watchedDuration
  }, [watchedDuration])

  const saveProgress = useCallback(() => {
    if (!id || !isAuthenticated) return
    const current = progressRef.current + 30
    progressRef.current = current
    setWatchedDuration(current)
    const isCompleted = video ? current / video.duration >= 0.9 : false
    updateProgress(id, current, isCompleted).catch(() => {})
  }, [id, isAuthenticated, video])

  useEffect(() => {
    if (!video || !isAuthenticated) return
    intervalRef.current = setInterval(saveProgress, 30000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [video, isAuthenticated, saveProgress])

  const handleAddBookmark = async () => {
    if (!id || !isAuthenticated) return
    try {
      const { data } = await addBookmark(id, watchedDuration, bookmarkNote || undefined)
      const bookmark = (data as any)?.data ?? data
      setBookmarks((prev) => [...prev, bookmark].sort((a, b) => a.positionSec - b.positionSec))
      setBookmarkNote("")
    } catch {
      alert("북마크 추가에 실패했습니다.")
    }
  }

  const handleDeleteBookmark = async (bookmarkId: string) => {
    try {
      await deleteBookmark(bookmarkId)
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId))
    } catch {
      alert("북마크 삭제에 실패했습니다.")
    }
  }

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

  const startSeconds = watchedDuration > 0 ? `&start=${watchedDuration}` : ""

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <button className={styles.backLink} onClick={() => navigate(-1)}>
          ← 돌아가기
        </button>

        <div className={styles.layout}>
          <div className={styles.mainContent}>
            <div className={styles.playerWrap}>
              <iframe
                ref={playerRef}
                className={styles.player}
                src={`https://www.youtube.com/embed/${video.youtubeVideoId}?enablejsapi=1${startSeconds}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className={styles.info}>
              <h1 className={styles.title}>{video.title}</h1>
              <div className={styles.meta}>
                <span className={styles.metaItem}>⏱ {formatDuration(video.duration)}</span>
                {watchedDuration > 0 && (
                  <span className={styles.metaItem}>
                    📍 {formatSec(watchedDuration)} 까지 시청
                  </span>
                )}
                <a
                  className={styles.youtubeLink}
                  href={`https://www.youtube.com/watch?v=${video.youtubeVideoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ▶ YouTube에서 보기
                </a>
              </div>

              {isAuthenticated && (
                <div className={styles.bookmarkAdd}>
                  <input
                    type="text"
                    className={styles.bookmarkInput}
                    placeholder="북마크 메모 (선택)"
                    value={bookmarkNote}
                    onChange={(e) => setBookmarkNote(e.target.value)}
                  />
                  <button
                    className={styles.bookmarkBtn}
                    onClick={handleAddBookmark}
                  >
                    🔖 현재 위치 북마크 ({formatSec(watchedDuration)})
                  </button>
                  <button
                    className={styles.bookmarkToggle}
                    onClick={() => setShowBookmarkPanel((prev) => !prev)}
                  >
                    북마크 목록 {showBookmarkPanel ? "▲" : "▼"} ({bookmarks.length})
                  </button>
                </div>
              )}
            </div>
          </div>

          {showBookmarkPanel && isAuthenticated && (
            <aside className={styles.bookmarkPanel}>
              <h3 className={styles.bookmarkPanelTitle}>🔖 북마크</h3>
              {bookmarks.length === 0 ? (
                <p className={styles.noBookmark}>북마크가 없습니다.</p>
              ) : (
                <ul className={styles.bookmarkList}>
                  {bookmarks.map((b) => (
                    <li key={b.id} className={styles.bookmarkItem}>
                      <span className={styles.bookmarkTime}>{formatSec(b.positionSec)}</span>
                      <span className={styles.bookmarkNote}>{b.note || "—"}</span>
                      <button
                        className={styles.bookmarkDeleteBtn}
                        onClick={() => handleDeleteBookmark(b.id)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
