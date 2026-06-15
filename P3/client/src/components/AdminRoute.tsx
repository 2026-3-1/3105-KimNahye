import { Navigate } from "react-router-dom"
import useAuthStore from "../store/AuthStore"

interface Props {
  children: React.ReactNode
}

export default function AdminRoute({ children }: Props) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}
