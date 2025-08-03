export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref(null)
    const accessToken = ref(null)
    const refreshToken = ref(null)
    const isAuthenticated = ref(false)
    const loading = ref(false)
    const error = ref(null)

    // 초기화 (토큰을 localStorage에서 복원)
    const initializeAuth = () => {
        if (process.client) {
            const storedToken = localStorage.getItem('accessToken')
            const storedRefreshToken = localStorage.getItem('refreshToken')
            const storedUser = localStorage.getItem('user')

            if (storedToken && storedUser) {
                accessToken.value = storedToken
                refreshToken.value = storedRefreshToken
                user.value = JSON.parse(storedUser)
                isAuthenticated.value = true

                // 토큰 유효성 검증
                validateToken()
            }
        }
    }

    // 토큰 유효성 검증
    const validateToken = async () => {
        if (!accessToken.value) return false

        try {
            const api = useUserApi()
            await api.getCurrentUser()
            return true
        } catch (err) {
            console.warn('Token validation failed:', err)
            logout()
            return false
        }
    }

    // 회원가입
    const register = async (registrationData) => {
        loading.value = true
        error.value = null

        try {
            console.log('사용자 등록 시도:', registrationData.username)
            const api = useUserApi()
            const response = await api.register(registrationData)

            console.log('등록 성공:', response.data)
            return response.data
        } catch (err) {
            console.error('등록 실패:', err)
            error.value = err.message || '회원가입에 실패했습니다.'
            throw err
        } finally {
            loading.value = false
        }
    }

    // 로그인
    const login = async (loginData) => {
        loading.value = true
        error.value = null

        try {
            console.log('로그인 시도:', loginData.usernameOrEmail)
            const api = useUserApi()
            const response = await api.login(loginData)

            const { accessToken: newAccessToken, refreshToken: newRefreshToken, user: userData } = response.data

            // 상태 업데이트
            accessToken.value = newAccessToken
            refreshToken.value = newRefreshToken
            user.value = userData
            isAuthenticated.value = true

            // localStorage에 저장
            if (process.client) {
                localStorage.setItem('accessToken', newAccessToken)
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken)
                }
                localStorage.setItem('user', JSON.stringify(userData))
            }

            console.log('로그인 성공:', userData.username)
            return response.data
        } catch (err) {
            console.error('로그인 실패:', err)
            error.value = err.message || '로그인에 실패했습니다.'
            throw err
        } finally {
            loading.value = false
        }
    }

    // 로그아웃
    const logout = () => {
        console.log('로그아웃')

        // 상태 초기화
        user.value = null
        accessToken.value = null
        refreshToken.value = null
        isAuthenticated.value = false
        error.value = null

        // localStorage 정리
        if (process.client) {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
        }

        // 로그인 페이지로 리디렉션 (필요시)
        const router = useRouter()
        router.push('/auth/login')
    }

    // 현재 사용자 정보 새로고침
    const fetchCurrentUser = async () => {
        if (!isAuthenticated.value) return

        try {
            const api = useUserApi()
            const response = await api.getCurrentUser()

            user.value = response.data

            // localStorage 업데이트
            if (process.client) {
                localStorage.setItem('user', JSON.stringify(response.data))
            }

            return response.data
        } catch (err) {
            console.error('사용자 정보 조회 실패:', err)
            logout()
            throw err
        }
    }

    // 프로필 업데이트
    const updateProfile = async (profileData) => {
        loading.value = true
        error.value = null

        try {
            const api = useUserApi()
            const response = await api.updateProfile(profileData)

            user.value = response.data

            // localStorage 업데이트
            if (process.client) {
                localStorage.setItem('user', JSON.stringify(response.data))
            }

            console.log('프로필 업데이트 성공')
            return response.data
        } catch (err) {
            console.error('프로필 업데이트 실패:', err)
            error.value = err.message || '프로필 업데이트에 실패했습니다.'
            throw err
        } finally {
            loading.value = false
        }
    }

    // 비밀번호 변경
    const changePassword = async (passwordData) => {
        loading.value = true
        error.value = null

        try {
            const api = useUserApi()
            await api.changePassword(passwordData)

            console.log('비밀번호 변경 성공')
        } catch (err) {
            console.error('비밀번호 변경 실패:', err)
            error.value = err.message || '비밀번호 변경에 실패했습니다.'
            throw err
        } finally {
            loading.value = false
        }
    }

    // 사용자명 중복 확인
    const checkUsername = async (username) => {
        try {
            const api = useUserApi()
            const response = await api.checkUsername(username)
            return response.data // true면 사용 가능, false면 이미 존재
        } catch (err) {
            console.error('사용자명 확인 실패:', err)
            return false
        }
    }

    // 이메일 중복 확인
    const checkEmail = async (email) => {
        try {
            const api = useUserApi()
            const response = await api.checkEmail(email)
            return response.data // true면 사용 가능, false면 이미 존재
        } catch (err) {
            console.error('이메일 확인 실패:', err)
            return false
        }
    }

    // 이메일 인증
    const verifyEmail = async (token) => {
        try {
            const api = useUserApi()
            await api.verifyEmail(token)

            // 사용자 정보 새로고침
            if (isAuthenticated.value) {
                await fetchCurrentUser()
            }

            console.log('이메일 인증 성공')
        } catch (err) {
            console.error('이메일 인증 실패:', err)
            throw err
        }
    }

    // 토큰 갱신
    const refreshAccessToken = async () => {
        if (!refreshToken.value) {
            logout()
            return false
        }

        try {
            const api = useUserApi()
            const response = await api.refreshToken(refreshToken.value)

            accessToken.value = response.data.accessToken

            if (process.client) {
                localStorage.setItem('accessToken', response.data.accessToken)
            }

            return true
        } catch (err) {
            console.error('토큰 갱신 실패:', err)
            logout()
            return false
        }
    }

    // Getters
    const currentUser = computed(() => user.value)
    const isLoggedIn = computed(() => isAuthenticated.value && !!user.value)
    const userRole = computed(() => user.value?.role || 'USER')
    const isAdmin = computed(() => userRole.value === 'ADMIN')
    const isModerator = computed(() => ['ADMIN', 'MODERATOR'].includes(userRole.value))

    // 에러 초기화
    const clearError = () => {
        error.value = null
    }

    return {
        // State
        user: readonly(user),
        accessToken: readonly(accessToken),
        isAuthenticated: readonly(isAuthenticated),
        loading: readonly(loading),
        error: readonly(error),

        // Getters
        currentUser,
        isLoggedIn,
        userRole,
        isAdmin,
        isModerator,

        // Actions
        initializeAuth,
        validateToken,
        register,
        login,
        logout,
        fetchCurrentUser,
        updateProfile,
        changePassword,
        checkUsername,
        checkEmail,
        verifyEmail,
        refreshAccessToken,
        clearError
    }
})