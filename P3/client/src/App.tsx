import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/layout/Navbar"
import ProtectedRoute from "./components/ProtectedRoute"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Courses from "./pages/Courses"
import CourseDetailPage from "./pages/CourseDetail"
import MyCourses from "./pages/MyCourses"
import Profile from "./pages/Profile"
import Cart from "./pages/Cart"
import useAuthStore from "./store/AuthStore"
import { useEffect } from "react"
import { getMyInfo } from "./api/UserApi"
import VideoDetailPage from "./pages/VideoDetail"
import CreateCourse from "./pages/CreateCourse"
import EditCourse from "./pages/EditCourse"
import RegisterVideo from "./pages/RegisterVideo"
import TeacherCourses from "./pages/TeacherCourse"
import PaymentSuccess from "./pages/PaymentSuccess"
import PaymentFail from "./pages/PaymentFail"

export default function App() {
  const { isAuthenticated, setUser } = useAuthStore()

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
    <BrowserRouter>
      <Navbar />
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
      </Routes>
    </BrowserRouter>
  )
}
