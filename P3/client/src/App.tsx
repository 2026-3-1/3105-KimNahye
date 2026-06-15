import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { lazy, Suspense, useEffect } from "react"
import Navbar from "./components/layout/Navbar"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"
import useAuthStore from "./store/AuthStore"
import { getMyInfo } from "./api/UserApi"

const Home = lazy(() => import("./pages/Home"))
const Login = lazy(() => import("./pages/Login"))
const Signup = lazy(() => import("./pages/Signup"))
const Courses = lazy(() => import("./pages/Courses"))
const CourseDetailPage = lazy(() => import("./pages/CourseDetail"))
const MyCourses = lazy(() => import("./pages/MyCourses"))
const Profile = lazy(() => import("./pages/Profile"))
const Cart = lazy(() => import("./pages/Cart"))
const VideoDetailPage = lazy(() => import("./pages/VideoDetail"))
const CreateCourse = lazy(() => import("./pages/CreateCourse"))
const EditCourse = lazy(() => import("./pages/EditCourse"))
const RegisterVideo = lazy(() => import("./pages/RegisterVideo"))
const TeacherCourses = lazy(() => import("./pages/TeacherCourse"))
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"))
const PaymentFail = lazy(() => import("./pages/PaymentFail"))
const Admin = lazy(() => import("./pages/Admin"))
const AdminLogin = lazy(() => import("./pages/AdminLogin"))

function AppInner() {
  const { isAuthenticated, setUser } = useAuthStore()
  const location = useLocation()
  const isAdminArea = location.pathname.startsWith("/admin")

  useEffect(() => {
    if (!isAuthenticated) return
    getMyInfo()
      .then(({ data }) => {
        const user = (data as any)?.data ?? data
        setUser(user)
      })
      .catch(() => {})
  }, [])

  return (
    <>
      {!isAdminArea && <Navbar />}
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>로딩 중...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* 로그인 필요 */}
          <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/videos/:id" element={<ProtectedRoute><VideoDetailPage /></ProtectedRoute>} />

          {/* TEACHER 전용 */}
          <Route path="/courses/create" element={<ProtectedRoute role="teacher"><CreateCourse /></ProtectedRoute>} />
          <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherCourses /></ProtectedRoute>} />
          <Route path="/teacher/edit/:id" element={<ProtectedRoute role="teacher"><EditCourse /></ProtectedRoute>} />
          <Route path="/videos/register/:courseId" element={<ProtectedRoute role="teacher"><RegisterVideo /></ProtectedRoute>} />

          {/* 결제 */}
          <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/payment/fail" element={<PaymentFail />} />

          {/* ADMIN 전용 (완전 분리) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        </Routes>
      </Suspense>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}
