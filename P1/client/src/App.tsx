import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/layout/Navbar"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Courses from "./pages/Courses"
import CourseDetailPage from "./pages/CourseDetail"
import MyCourses from "./pages/MyCourses"
import Profile from "./pages/Profile"
import useAuthStore from "./store/AuthStore"
import { useEffect } from "react"
import { getMyInfo } from "./api/UserApi"
import VideoDetailPage from "./pages/VideoDetail"
import CreateCourse from "./pages/CreateCourse"
import RegisterVideo from "./pages/RegisterVideo"

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
        <Route path="/courses/create" element={<CreateCourse />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/videos/register/:courseId" element={<RegisterVideo />} />
        <Route path="/videos/:id" element={<VideoDetailPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}
