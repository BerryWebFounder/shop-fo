export const useApi = () => {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl

    console.log('API Base URL:', baseURL) // 디버깅용

    const api = $fetch.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json'
        },
        onRequest({ request, options }) {
            console.log('API Request:', request, options) // 디버깅용
        },
        onRequestError({ request, error }) {
            console.error('API Request Error:', error) // 에러 로깅
        },
        onResponse({ response }) {
            console.log('API Response:', response) // 응답 로깅
        },
        onResponseError({ response }) {
            console.error('API Response Error:', response) // 에러 로깅
        }
    })

    return {
        // 게시글 API
        posts: {
            getAll: (params = {}) => api('/posts', { params }),
            getById: (id) => api(`/posts/${id}`),
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