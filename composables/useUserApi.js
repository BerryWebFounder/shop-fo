import {useAuthStore} from "~/stores/auth.js";

export const useUserApi = () => {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()

    // User Service 기본 URL
    const baseURL = config.public.userServiceUrl || 'http://localhost:8082/api/users'

    // API 인스턴스 생성
    const api = $fetch.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json'
        },
        onRequest({ request, options }) {
            // 인증 토큰 추가
            if (authStore.accessToken) {
                options.headers = {
                    ...options.headers,
                    Authorization: `Bearer ${authStore.accessToken}`
                }
            }
            console.log('User API Request:', { request, options })
        },
        onRequestError({ request, error }) {
            console.error('User API Request Error:', { request, error })
        },
        onResponse({ response }) {
            console.log('User API Response:', {
                status: response.status,
                url: response.url
            })
        },
        onResponseError({ response, request }) {
            console.error('User API Response Error:', {
                status: response.status,
                statusText: response.statusText,
                url: response.url,
                request
            })

            // 401 Unauthorized - 토큰 만료
            if (response.status === 401) {
                authStore.logout()
                throw new Error('인증이 필요합니다. 다시 로그인해주세요.')
            }

            // 403 Forbidden - 권한 없음
            if (response.status === 403) {
                throw new Error('접근 권한이 없습니다.')
            }

            // 400 Bad Request - 잘못된 요청
            if (response.status === 400) {
                const errorMessage = response._data?.message || '잘못된 요청입니다.'
                throw new Error(errorMessage)
            }

            // 409 Conflict - 중복 데이터
            if (response.status === 409) {
                const errorMessage = response._data?.message || '이미 존재하는 데이터입니다.'
                throw new Error(errorMessage)
            }

            // 500 Internal Server Error
            if (response.status === 500) {
                throw new Error('서버 오류가 발생했습니다.')
            }

            throw new Error(response._data?.message || '알 수 없는 오류가 발생했습니다.')
        }
    })

    return {
        // 인증
        register: (data) => api('/register', { method: 'POST', body: data }),
        login: (data) => api('/login', { method: 'POST', body: data }),

        // 사용자 정보
        getCurrentUser: () => api('/me'),
        getUserById: (id) => api(`/${id}`),
        getUserByUsername: (username) => api(`/username/${username}`),

        // 프로필 관리
        updateProfile: (data) => api('/me', { method: 'PUT', body: data }),
        changePassword: (data) => api('/me/password', { method: 'PUT', body: data }),

        // 검증
        checkUsername: (username) => api(`/check-username?username=${username}`),
        checkEmail: (email) => api(`/check-email?email=${email}`),
        verifyEmail: (token) => api('/verify-email', { method: 'POST', body: { token } }),

        // 사용자 검색 (공개)
        searchUsers: (keyword, page = 0, size = 10) =>
            api(`/search?keyword=${keyword}&page=${page}&size=${size}`),

        // 관리자 기능
        getUsers: (page = 0, size = 20) =>
            api(`?page=${page}&size=${size}`),
        getUserStats: () => api('/stats'),
        updateUserStatus: (id, status) =>
            api(`/${id}/status`, { method: 'PUT', body: { status } }),

        // 토큰 갱신
        refreshToken: (refreshToken) =>
            api('/refresh', { method: 'POST', body: { refreshToken } }),

        // 헬스 체크
        healthCheck: () => api('/health')
    }
}