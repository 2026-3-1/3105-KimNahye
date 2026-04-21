import { Navigate } from "react-router-dom"
import useAuthStore from "../store/AuthStore"

interface Props {
  children: React.ReactNode
  role?: "teacher" | "student"
}

export default function ProtectedRoute({ children, role }: Props) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role && user?.role !== role) return <Navigate to="/" replace />

  return <>{children}</>
}
