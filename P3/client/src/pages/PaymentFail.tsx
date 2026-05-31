import { useSearchParams, useNavigate } from "react-router-dom"

export default function PaymentFail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const errorCode = searchParams.get("code")
  const errorMessage = searchParams.get("message")

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: "16px",
    fontFamily: "inherit",
    textAlign: "center",
    padding: "40px 20px",
  }

  const btnStyle: React.CSSProperties = {
    marginTop: "8px",
    padding: "12px 28px",
    background: "#6c5ce7",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  }

  return (
    <div style={containerStyle}>
      <div style={{ fontSize: "3rem" }}>❌</div>
      <h2 style={{ margin: 0, color: "#e74c3c" }}>결제가 실패했습니다</h2>
      <p style={{ color: "#555" }}>
        {errorMessage ?? "결제가 취소되었거나 오류가 발생했습니다."}
      </p>
      {errorCode && (
        <p style={{ color: "#aaa", fontSize: "13px" }}>오류 코드: {errorCode}</p>
      )}
      <button style={btnStyle} onClick={() => navigate(-1)}>
        돌아가기
      </button>
    </div>
  )
}
