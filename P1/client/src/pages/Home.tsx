import { Link } from "react-router-dom"
import styles from "./Home.module.css"
import useAuthStore from "../store/AuthStore"

type Feature = { icon: string; title: string; desc: string }

const FEATURES: Feature[] = [
  {
    icon: "🎓",
    title: "전문 셰프 강의",
    desc: "현직 셰프들이 직접 촬영한 고품질 영상 강의",
  },
  {
    icon: "🔍",
    title: "맞춤 필터링",
    desc: "카테고리, 난이도, 보유 도구로 내게 맞는 강의 탐색",
  },
  {
    icon: "📱",
    title: "편리한 수강",
    desc: "언제 어디서나 원하는 강의를 자유롭게 수강",
  },
]

const CATEGORIES = ["한식", "양식", "중식", "일식", "디저트"] as const
const EMOJI_MAP: Record<string, string> = {
  한식: "🍚",
  양식: "🍝",
  중식: "🥢",
  일식: "🍱",
  디저트: "🍰",
}

export default function Home() {
  const user = useAuthStore((state) => state.user)
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>
            ✨ 요리를 배우는 가장 쉬운 방법
          </div>
          <h1 className={styles.heroTitle}>
            집에서 배우는
            <br />
            <span className={styles.heroAccent}>셰프의 요리 비법</span>
          </h1>
          <p className={styles.heroDesc}>
            전문 셰프의 동영상 강의로 요리 실력을 키워보세요.
            <br />
            한식부터 디저트까지, 내 실력에 맞는 강의를 찾아보세요.
          </p>
          <div className={styles.heroBtns}>
            <Link to="/courses" className={styles.primaryBtn}>
              강의 탐색하기 →
            </Link>
            <Link to="/signup" className={styles.secondaryBtn}>
              무료로 시작하기
            </Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroCard}>
            <span className={styles.heroEmoji}>👨‍🍳</span>
            <span className={styles.heroCardText}>오늘의 추천 강의</span>
          </div>
          <div className={styles.floatBadge1}>🍳 한식 입문</div>
          <div className={styles.floatBadge2}>⭐ 4.9점</div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>카테고리별 탐색</h2>
          <div className={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to={`/courses?category=${cat}`}
                className={styles.categoryCard}
              >
                <span className={styles.categoryEmoji}>{EMOJI_MAP[cat]}</span>
                <span className={styles.categoryName}>{cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.featureSection}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>왜 끼니해결인가요?</h2>
          <div className={styles.featureGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>지금 바로 시작해보세요</h2>
          <p className={styles.ctaDesc}>
            수백 개의 강의가 여러분을 기다리고 있습니다.
          </p>

          <Link to="/signup" className={styles.ctaBtn}>
            무료 회원가입
          </Link>

          {user?.role === "teacher" && (
            <Link to="/courses/create" className={styles.teacherBtn}>
              강의 등록하기
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
