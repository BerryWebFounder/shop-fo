export const useApi = () => {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl

    const api = $fetch.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json'
        },
        onRequest({ request, options }) {
            console.log('API Request:', { request, options })
        },
        onRequestError({ request, error }) {
            console.error('API Request Error:', { request, error })
        },
        onResponse({ response }) {
            console.log('API Response:', {
                status: response.status,
                url: response.url,
                data: response._data
            })
        },
        onResponseError({ response, request }) {
            console.error('API Response Error:', {
                status: response.status,
                statusText: response.statusText,
                url: response.url,
                request,
                data: response._data
            })

            // 에러 메시지 처리
            let errorMessage = '서버 오류가 발생했습니다.'

            if (response.status === 404) {
                errorMessage = '요청한 리소스를 찾을 수 없습니다.'
            } else if (response.status === 400) {
                errorMessage = '잘못된 요청입니다.'
            } else if (response.status === 401) {
                errorMessage = '인증이 필요합니다.'
            } else if (response.status === 403) {
                errorMessage = '접근 권한이 없습니다.'
            } else if (response.status === 413) {
                errorMessage = '파일 크기가 너무 큽니다.'
            } else if (response.status === 500) {
                errorMessage = '서버 내부 오류가 발생했습니다.'
            } else if (response._data?.message) {
                errorMessage = response._data.message
            }

            throw new Error(errorMessage)
        }
    })

    // 파일 업로드용 별도 API 인스턴스
    const fileApi = $fetch.create({
        baseURL,
        onRequest({ request, options }) {
            console.log('File API Request:', { request, options })
            // 파일 업로드 시 Content-Type 헤더 제거 (브라우저가 자동 설정)
            if (options.body instanceof FormData) {
                delete options.headers['Content-Type']
            }
        },
        onRequestError({ request, error }) {
            console.error('File API Request Error:', { request, error })
        },
        onResponse({ response }) {
            console.log('File API Response:', {
                status: response.status,
                url: response.url
            })
        },
        onResponseError({ response, request }) {
            console.error('File API Response Error:', {
                status: response.status,
                statusText: response.statusText,
                url: response.url,
                request
            })

            let errorMessage = '파일 처리 중 오류가 발생했습니다.'

            if (response.status === 413) {
                errorMessage = '파일 크기가 너무 큽니다.'
            } else if (response.status === 415) {
                errorMessage = '지원하지 않는 파일 형식입니다.'
            } else if (response.status === 400) {
                errorMessage = '파일 업로드 요청이 잘못되었습니다.'
            } else if (response._data?.message) {
                errorMessage = response._data.message
            }

            throw new Error(errorMessage)
        }
    })

    return {
        // 게시글 API (개선됨 - 공지사항 지원)
        posts: {
            // 일반 게시글만 조회 (공지사항 제외)
            getAll: (params = {}) => api('/posts', { params }),

            // 전체 게시글 조회 (공지사항 + 일반 게시글)
            getAllWithNotices: (params = {}) => api('/posts/all', { params }),

            getById: (id) => {
                console.log('Getting post by ID:', id)
                return api(`/posts/${id}`)
            },
            create: (data) => api('/posts', { method: 'POST', body: data }),
            update: (id, data) => api(`/posts/${id}`, { method: 'PUT', body: data }),
            delete: (id) => api(`/posts/${id}`, { method: 'DELETE' }),
            search: (params) => api('/posts/search', { params }),
            getStats: () => api('/posts/stats'),
            getWithFiles: (params = {}) => api('/posts/with-files', { params })
        },

        // 공지사항 전용 API (새로 추가)
        notices: {
            // 기본 CRUD
            getAll: (params = {}) => api('/notices', { params }),
            getActive: (params = {}) => api('/notices/active', { params }),
            getPinned: () => api('/notices/pinned'),
            getRegular: () => api('/notices/regular'),
            getById: (id) => {
                console.log('Getting notice by ID:', id)
                return api(`/notices/${id}`)
            },
            create: (data) => {
                console.log('Creating notice:', data)
                return api('/notices', { method: 'POST', body: data })
            },
            update: (id, data) => {
                console.log('Updating notice:', id, data)
                return api(`/notices/${id}`, { method: 'PUT', body: data })
            },
            delete: (id) => {
                console.log('Deleting notice:', id)
                return api(`/notices/${id}`, { method: 'DELETE' })
            },

            // 상태 관리
            toggleStatus: (id) => api(`/notices/${id}/toggle-status`, { method: 'PATCH' }),

            // 검색
            search: (params) => api('/notices/search', { params }),

            // 통계
            getStats: () => api('/notices/stats'),

            // 특수 조회
            getExpiringSoon: () => api('/notices/expiring-soon'),

            // 메인 페이지용 (제한된 개수)
            getForMainPage: () => api('/notices/active').then(response => {
                // 메인 페이지에는 최대 5개만 표시
                const notices = Array.isArray(response) ? response : response.content || []
                return notices.slice(0, 5)
            })
        },

        // 관리자 API (새로 추가)
        admin: {
            notices: {
                getAll: (params = {}) => api('/admin/notices/all', { params }),
                getInactive: (params = {}) => api('/admin/notices/inactive', { params }),
                getExpired: () => api('/admin/notices/expired'),

                // 일괄 처리
                batchUpdateStatus: (data) => api('/admin/notices/batch-status', {
                    method: 'PATCH',
                    body: data
                }),
                batchDelete: (data) => api('/admin/notices/batch-delete', {
                    method: 'DELETE',
                    body: data
                }),

                // 관리 기능
                cleanupExpired: () => api('/admin/notices/cleanup-expired', { method: 'POST' }),
                resendNotification: (id) => api(`/admin/notices/${id}/resend-notification`, {
                    method: 'POST'
                }),

                // 상세 통계
                getDetailedStats: () => api('/admin/notices/detailed-stats'),
                getConfig: () => api('/admin/notices/config')
            }
        },

        // 댓글 API (기존 유지)
        comments: {
            getByPostId: (postId) => api(`/comments/post/${postId}`),
            getByNoticeId: (noticeId) => api(`/comments/notice/${noticeId}`), // 공지사항용 추가
            create: (data) => api('/comments', { method: 'POST', body: data }),
            update: (id, data) => api(`/comments/${id}`, { method: 'PUT', body: data }),
            delete: (id) => api(`/comments/${id}`, { method: 'DELETE' })
        },

        // 파일 API (공지사항 지원 강화)
        files: {
            // 일반 게시글 파일
            getByPostId: (postId) => {
                console.log('Fetching files for post:', postId)
                return api(`/files/post/${postId}`)
            },

            // 공지사항 파일 (새로 추가)
            getByNoticeId: (noticeId) => {
                console.log('Fetching files for notice:', noticeId)
                return api(`/files/notice/${noticeId}`)
            },

            // 파일 업로드 (일반 게시글)
            upload: async (postId, formData) => {
                console.log('Uploading files to post:', postId)
                console.log('FormData entries:', Array.from(formData.entries()).map(([key, value]) =>
                    [key, value instanceof File ? `${value.name} (${value.size} bytes)` : value]
                ))

                try {
                    const response = await fileApi(`/files/upload/${postId}`, {
                        method: 'POST',
                        body: formData
                    })
                    console.log('Upload successful:', response)
                    return response
                } catch (error) {
                    console.error('Upload failed:', error)
                    throw error
                }
            },

            // 공지사항 파일 업로드 (새로 추가)
            uploadToNotice: async (noticeId, formData) => {
                console.log('Uploading files to notice:', noticeId)

                try {
                    const response = await fileApi(`/files/upload/notice/${noticeId}`, {
                        method: 'POST',
                        body: formData
                    })
                    console.log('Notice file upload successful:', response)
                    return response
                } catch (error) {
                    console.error('Notice file upload failed:', error)
                    throw error
                }
            },

            uploadSingle: async (postId, file) => {
                const formData = new FormData()
                formData.append('file', file)
                return await this.upload(postId, formData)
            },

            delete: (id) => {
                console.log('Deleting file:', id)
                return api(`/files/${id}`, { method: 'DELETE' })
            },

            getDownloadUrl: (storedName) => {
                const url = `${baseURL}/files/download/${storedName}`
                console.log('Download URL:', url)
                return url
            },

            getFileInfo: (id) => api(`/files/${id}`),

            // 파일 메타데이터만 업데이트 (파일명 변경 등)
            updateMetadata: (id, data) => api(`/files/${id}/metadata`, {
                method: 'PUT',
                body: data
            })
        },

        // 모니터링 API (새로 추가)
        monitoring: {
            // Actuator 엔드포인트
            health: () => api('/actuator/health'),
            noticeStats: () => api('/actuator/notice-stats'),
            metrics: () => api('/actuator/metrics'),

            // 커스텀 모니터링
            getSystemStatus: async () => {
                try {
                    const [health, stats, postStats] = await Promise.all([
                        api('/actuator/health'),
                        api('/actuator/notice-stats'),
                        api('/posts/stats')
                    ])

                    return {
                        health,
                        noticeStats: stats,
                        postStats,
                        timestamp: new Date().toISOString()
                    }
                } catch (error) {
                    console.error('System status check failed:', error)
                    return {
                        error: error.message,
                        timestamp: new Date().toISOString()
                    }
                }
            }
        },

        // 공통 유틸리티
        utils: {
            ping: () => api('/health'),
            getServerInfo: () => api('/info'),

            // 공지사항 유효성 검증 (클라이언트 사이드)
            validateNotice: (noticeData) => {
                const errors = []

                if (!noticeData.title || noticeData.title.trim().length === 0) {
                    errors.push('제목은 필수입니다.')
                }

                if (noticeData.title && noticeData.title.length > 200) {
                    errors.push('제목은 200자를 초과할 수 없습니다.')
                }

                if (!noticeData.content || noticeData.content.trim().length === 0) {
                    errors.push('내용은 필수입니다.')
                }

                if (noticeData.content && noticeData.content.length > 10000) {
                    errors.push('내용은 10,000자를 초과할 수 없습니다.')
                }

                if (!noticeData.author || noticeData.author.trim().length === 0) {
                    errors.push('작성자는 필수입니다.')
                }

                if (noticeData.expiryDate) {
                    const expiryDate = new Date(noticeData.expiryDate)
                    if (expiryDate <= new Date()) {
                        errors.push('만료일은 현재 시간보다 미래여야 합니다.')
                    }
                }

                return {
                    valid: errors.length === 0,
                    errors
                }
            },

            // 공지사항 타입 확인
            isNotice: (post) => {
                return post && post.isNotice === true
            },

            // 중요 공지사항 확인
            isPinnedNotice: (post) => {
                return post && post.isNotice === true && post.isPinned === true
            },

            // 활성 공지사항 확인
            isActiveNotice: (post) => {
                return post && post.isNotice === true && post.isActive === true
            },

            // 만료된 공지사항 확인
            isExpiredNotice: (post) => {
                if (!post || !post.isNotice || !post.expiryDate) {
                    return false
                }
                return new Date(post.expiryDate) <= new Date()
            },

            // 만료 임박 공지사항 확인 (3일 이내)
            isExpiringSoon: (post, days = 3) => {
                if (!post || !post.isNotice || !post.expiryDate) {
                    return false
                }
                const expiryDate = new Date(post.expiryDate)
                const warningDate = new Date()
                warningDate.setDate(warningDate.getDate() + days)

                return expiryDate <= warningDate && expiryDate > new Date()
            }
        }
    }
}