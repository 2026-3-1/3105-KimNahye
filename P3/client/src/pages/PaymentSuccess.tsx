import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { confirmPayment } from "../api/PaymentApi"
import type { AxiosError } from "axios"

type Status = "loading" | "success" | "error"

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<Status>("loading")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    const run = async () => {
      const paymentKey = searchParams.get("paymentKey")
      const orderId = searchParams.get("orderId")
      const amount = searchParams.get("amount")
      const courseId = sessionStorage.getItem("pendingCourseId")

      if (!paymentKey || !orderId || !amount || !courseId) {
        setErrorMsg("결제 정보가 올바르지 않습니다.")
        setStatus("error")
        return
      }

      try {
        await confirmPayment({ paymentKey, orderId, amount: Number(amount), courseId })
        sessionStorage.removeItem("pendingCourseId")
        setStatus("success")
      } catch (err) {
        const axiosError = err as AxiosError<{ message: string }>
        setErrorMsg(axiosError.response?.data?.message ?? "결제 승인에 실패했습니다.")
        setStatus("error")
      }
    }

    run()
  }, [])

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

  if (status === "loading") {
    return (
      <div style={containerStyle}>
        <p style={{ fontSize: "1.1rem", color: "#555" }}>결제 처리 중...</p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div style={containerStyle}>
        <h2 style={{ color: "#e74c3c" }}>결제 실패</h2>
        <p style={{ color: "#555" }}>{errorMsg}</p>
        <button style={btnStyle} onClick={() => navigate("/courses")}>
          강의 목록으로
        </button>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={{ fontSize: "3rem" }}>✅</div>
      <h2 style={{ margin: 0 }}>결제가 완료되었습니다!</h2>
      <p style={{ color: "#555" }}>수강 신청이 완료되었습니다. 이메일을 확인해주세요.</p>
      <button style={btnStyle} onClick={() => navigate("/my-courses")}>
        내 강의 보러가기
      </button>
    </div>
  )
}
