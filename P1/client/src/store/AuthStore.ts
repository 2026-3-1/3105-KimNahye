import { create } from "zustand"
import type { UserProfile } from "../types/user/UserProfile"
import { persist } from "zustand/middleware"

type AuthState = {
  user: UserProfile | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (
    user: UserProfile,
    accessToken: string,
    refreshToken: string,
  ) => void
  setUser: (user: UserProfile) => void
  logout: () => void
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem("refreshToken", refreshToken)
        set({ user, accessToken, isAuthenticated: true })
      },

      setUser: (user) => set({ user }),

      logout: () => {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        set({ user: null, accessToken: null, isAuthenticated: false })
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)

export default useAuthStore
