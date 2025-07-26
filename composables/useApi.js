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
        // 게시글 API
        posts: {
            getAll: (params = {}) => api('/posts', { params }),
            getById: (id) => {
                console.log('Getting post by ID:', id)
                return api(`/posts/${id}`)
            },
            create: (data) => api('/posts', { method: 'POST', body: data }),
            update: (id, data) => api(`/posts/${id}`, { method: 'PUT', body: data }),
            delete: (id) => api(`/posts/${id}`, { method: 'DELETE' }),
            search: (params) => api('/posts/search', { params }),
            getStats: () => api('/posts/stats')
        },

        // 댓글 API
        comments: {
            getByPostId: (postId) => api(`/comments/post/${postId}`),
            create: (data) => api('/comments', { method: 'POST', body: data }),
            update: (id, data) => api(`/comments/${id}`, { method: 'PUT', body: data }),
            delete: (id) => api(`/comments/${id}`, { method: 'DELETE' })
        },

        // 파일 API (개선됨)
        files: {
            getByPostId: (postId) => {
                console.log('Fetching files for post:', postId)
                return api(`/files/post/${postId}`)
            },

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

            uploadSingle: async (postId, file) => {
                const formData = new FormData()
                formData.append('file', file)
                return await files.upload(postId, formData)
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

        // 공통 유틸리티
        utils: {
            ping: () => api('/health'),
            getServerInfo: () => api('/info')
        }
    }
}