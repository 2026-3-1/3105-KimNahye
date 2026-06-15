import apiClient from "./ApiClient"

interface ConfirmPaymentRequest {
  paymentKey: string
  orderId: string
  amount: number
  courseIds: string[]
}

export const confirmPayment = (data: ConfirmPaymentRequest) =>
  apiClient.post("/payments/confirm", data)
