export const useAuth = () => {
  const user = useState<any>('user', () => null)
  const token = useState<string | null>('token', () => null)

  const login = async (username: string, password: string) => {
    try {
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { username, password }
      })
      
      token.value = response.token
      user.value = response.user
      
      // 设置cookie
      const cookie = useCookie('auth-token', {
        maxAge: 60 * 60 * 24 * 7, // 7天
        httpOnly: false
      })
      cookie.value = response.token
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error?.data?.message || '登录失败' }
    }
  }

  const register = async (username: string, password: string) => {
    try {
      const response = await $fetch('/api/auth/register', {
        method: 'POST',
        body: { username, password }
      })
      
      token.value = response.token
      user.value = response.user
      
      // 设置cookie
      const cookie = useCookie('auth-token', {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: false
      })
      cookie.value = response.token
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error?.data?.message || '注册失败' }
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    const cookie = useCookie('auth-token')
    cookie.value = null
    navigateTo('/login')
  }

  const fetchUser = async () => {
    try {
      const cookie = useCookie('auth-token')
      if (!cookie.value) {
        user.value = null
        return
      }
      
      const userData = await $fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${cookie.value}`
        }
      })
      
      user.value = userData
      token.value = cookie.value
    } catch {
      user.value = null
      token.value = null
    }
  }

  return {
    user: readonly(user),
    token: readonly(token),
    login,
    register,
    logout,
    fetchUser
  }
}
