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
            } else if (response.status === 500) {
                errorMessage = '서버 내부 오류가 발생했습니다.'
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

        // 파일 API
        files: {
            getByPostId: (postId) => api(`/files/post/${postId}`),
            upload: (postId, formData) => api(`/files/upload/${postId}`, {
                method: 'POST',
                body: formData
            }),
            delete: (id) => api(`/files/${id}`, { method: 'DELETE' }),
            getDownloadUrl: (storedName) => `${baseURL}/files/download/${storedName}`
        }
    }
}