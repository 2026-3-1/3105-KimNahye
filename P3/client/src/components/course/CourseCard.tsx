import { Link } from "react-router-dom"
import type { CourseListItem } from "../../types/course/CourseListItem"
import styles from "./CourseCard.module.css"

const DIFFICULTY_COLOR: Record<string, string> = {
  상: "#e74c3c",
  중: "#FFA500",
  하: "#27ae60",
}

const CATEGORY_EMOJI: Record<string, string> = {
  한식: "🍚",
  양식: "🍝",
  중식: "🥢",
  일식: "🍱",
  디저트: "🍰",
  기타: "🍽️",
}

type Props = {
  course: CourseListItem
}

export default function CourseCard({ course }: Props) {
  const { id, category, difficulty, requiredTools, videoCount, teacher } =
    course
  const emoji = CATEGORY_EMOJI[category] ?? "🍽️"

  return (
    <Link to={`/courses/${id}`} className={styles.card}>
      <div className={styles.thumbnail}>
        <span className={styles.emoji}>{emoji}</span>
        <span className={styles.category}>{category}</span>
      </div>

      <div className={styles.body}>
        <div className={styles.meta}>
          <span
            className={styles.difficulty}
            style={{ color: DIFFICULTY_COLOR[difficulty] ?? "#999" }}
          >
            ● 난이도 {difficulty}
          </span>
          <span className={styles.videoCount}>📹 {videoCount}강</span>
        </div>

        <div className={styles.tools}>
          {requiredTools?.slice(0, 3).map((t) => (
            <span key={t} className={styles.tool}>
              {t}
            </span>
          ))}
          {requiredTools?.length > 3 && (
            <span className={styles.tool}>+{requiredTools.length - 3}</span>
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.teacher}>👨‍🍳 {teacher?.name ?? "선생님"}</span>
        </div>
      </div>
    </Link>
  )
}
