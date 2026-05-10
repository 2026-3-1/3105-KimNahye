import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getVideo } from "../api/VideoApi"
import { updateProgress, getProgress } from "../api/WatchLogApi"
import { getBookmarks, addBookmark, deleteBookmark } from "../api/BookmarkApi"
import useAuthStore from "../store/AuthStore"
import type { VideoDetail } from "../types/video/VideoDetail"
import type { AxiosError } from "axios"
import styles from "./VideoDetail.module.css"

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: (() => void) | undefined
  }
}

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

  const [initialPosition, setInitialPosition] = useState(0)
  const [progressLoaded, setProgressLoaded] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [completing, setCompleting] = useState(false)

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [bookmarkNote, setBookmarkNote] = useState("")
  const [showBookmarkPanel, setShowBookmarkPanel] = useState(false)

  const playerContainerRef = useRef<HTMLDivElement>(null)
  const ytPlayerRef = useRef<any>(null)

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

  // 이어보기 위치 조회
  useEffect(() => {
    if (!id) return
    if (!isAuthenticated) {
      setProgressLoaded(true)
      return
    }
    getProgress(id)
      .then(({ data }) => {
        const progress = (data as any)?.data ?? data
        if (progress?.watchedDuration > 0) {
          setInitialPosition(progress.watchedDuration)
          setCurrentTime(progress.watchedDuration)
        }
        if (progress?.isCompleted) setIsCompleted(true)
      })
      .catch(() => {})
      .finally(() => setProgressLoaded(true))
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

  // YouTube IFrame API 로드 + 플레이어 생성
  useEffect(() => {
    if (!video || !progressLoaded || !playerContainerRef.current) return

    const initPlayer = () => {
      if (!playerContainerRef.current || !window.YT?.Player) return
      ytPlayerRef.current = new window.YT.Player(playerContainerRef.current, {
        videoId: video.youtubeVideoId,
        playerVars: {
          start: initialPosition,
          enablejsapi: 1,
          rel: 0,
        },
      })
    }

    if (window.YT?.Player) {
      initPlayer()
    } else {
      const existing = document.getElementById("youtube-iframe-api")
      if (!existing) {
        const tag = document.createElement("script")
        tag.id = "youtube-iframe-api"
        tag.src = "https://www.youtube.com/iframe_api"
        document.body.appendChild(tag)
      }
      window.onYouTubeIframeAPIReady = initPlayer
    }

    return () => {
      try {
        ytPlayerRef.current?.destroy?.()
      } catch {
        /* noop */
      }
      ytPlayerRef.current = null
    }
  }, [video, progressLoaded, initialPosition])

  // 현재 재생 위치 1초마다 갱신 (버튼 라벨 표시용)
  useEffect(() => {
    if (!video || !progressLoaded) return
    const t = setInterval(() => {
      try {
        const sec = ytPlayerRef.current?.getCurrentTime?.()
        if (typeof sec === "number" && sec >= 0) {
          setCurrentTime(Math.floor(sec))
        }
      } catch {
        /* noop */
      }
    }, 1000)
    return () => clearInterval(t)
  }, [video, progressLoaded])

  // 30초마다 실제 재생 위치를 서버에 저장
  useEffect(() => {
    if (!video || !isAuthenticated || !id) return
    const interval = setInterval(() => {
      try {
        const time = ytPlayerRef.current?.getCurrentTime?.()
        if (typeof time !== "number" || time <= 0) return
        const sec = Math.floor(time)
        const isCompleted = sec / video.duration >= 0.9
        updateProgress(id, sec, isCompleted).catch(() => {})
      } catch {
        /* noop */
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [video, isAuthenticated, id])

  const handleMarkCompleted = async () => {
    if (!id || !isAuthenticated || completing || isCompleted) return
    setCompleting(true)
    let pos = currentTime
    try {
      const time = ytPlayerRef.current?.getCurrentTime?.()
      if (typeof time === "number" && time >= 0) {
        pos = Math.floor(time)
      }
    } catch {
      /* noop */
    }
    try {
      await updateProgress(id, pos, true)
      setIsCompleted(true)
    } catch {
      alert("수강 완료 처리에 실패했습니다.")
    } finally {
      setCompleting(false)
    }
  }

  const handleAddBookmark = async () => {
    if (!id || !isAuthenticated) return
    let pos = currentTime
    try {
      const time = ytPlayerRef.current?.getCurrentTime?.()
      if (typeof time === "number" && time >= 0) {
        pos = Math.floor(time)
      }
    } catch {
      /* noop */
    }
    try {
      const { data } = await addBookmark(id, pos, bookmarkNote || undefined)
      const bookmark = (data as any)?.data ?? data
      setBookmarks((prev) =>
        [...prev, bookmark].sort((a, b) => a.positionSec - b.positionSec),
      )
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

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <button className={styles.backLink} onClick={() => navigate(-1)}>
          ← 돌아가기
        </button>

        <div className={styles.layout}>
          <div className={styles.mainContent}>
            <div className={styles.playerWrap}>
              <div ref={playerContainerRef} className={styles.player} />
            </div>

            <div className={styles.info}>
              <h1 className={styles.title}>{video.title}</h1>
              <div className={styles.meta}>
                <span className={styles.metaItem}>
                  ⏱ {formatDuration(video.duration)}
                </span>
                {currentTime > 0 && (
                  <span className={styles.metaItem}>
                    📍 {formatSec(currentTime)} 재생 중
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
                <div className={styles.completeBox}>
                  <button
                    className={styles.completeBtn}
                    onClick={handleMarkCompleted}
                    disabled={completing || isCompleted}
                    data-completed={isCompleted}
                  >
                    {isCompleted
                      ? "✅ 수강 완료됨"
                      : completing
                        ? "처리 중..."
                        : "✓ 이 영상 수강 완료"}
                  </button>
                </div>
              )}

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
                    🔖 현재 위치 북마크 ({formatSec(currentTime)})
                  </button>
                  <button
                    className={styles.bookmarkToggle}
                    onClick={() => setShowBookmarkPanel((prev) => !prev)}
                  >
                    북마크 목록 {showBookmarkPanel ? "▲" : "▼"} (
                    {bookmarks.length})
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
                      <span className={styles.bookmarkTime}>
                        {formatSec(b.positionSec)}
                      </span>
                      <span className={styles.bookmarkNote}>
                        {b.note || "—"}
                      </span>
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
