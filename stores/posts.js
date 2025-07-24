export const usePostStore = defineStore('posts', () => {
    const api = useApi()

    // State
    const posts = ref([])
    const currentPost = ref(null)
    const loading = ref(false)
    const error = ref(null)
    const pagination = ref({
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0
    })

    // Actions
    const fetchPosts = async (page = 0, size = 10) => {
        loading.value = true
        error.value = null

        try {
            const response = await api.posts.getAll({ page, size })
            posts.value = response.content
            pagination.value = {
                page: response.number,
                size: response.size,
                totalPages: response.totalPages,
                totalElements: response.totalElements
            }
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    const fetchPostById = async (id) => {
        loading.value = true
        error.value = null

        try {
            const response = await api.posts.getById(id)
            currentPost.value = response
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    const createPost = async (postData) => {
        loading.value = true
        error.value = null

        try {
            const newPost = await api.posts.create(postData)
            posts.value.unshift(newPost)
            return newPost
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const updatePost = async (id, postData) => {
        loading.value = true
        error.value = null

        try {
            const updatedPost = await api.posts.update(id, postData)
            const index = posts.value.findIndex(p => p.id === id)
            if (index !== -1) {
                posts.value[index] = updatedPost
            }
            currentPost.value = updatedPost
            return updatedPost
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const deletePost = async (id) => {
        loading.value = true
        error.value = null

        try {
            await api.posts.delete(id)
            posts.value = posts.value.filter(p => p.id !== id)
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const searchPosts = async (searchParams, page = 0, size = 10) => {
        loading.value = true
        error.value = null

        try {
            const response = await api.posts.search({ ...searchParams, page, size })
            posts.value = response.content
            pagination.value = {
                page: response.number,
                size: response.size,
                totalPages: response.totalPages,
                totalElements: response.totalElements
            }
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    return {
        // State
        posts: readonly(posts),
        currentPost: readonly(currentPost),
        loading: readonly(loading),
        error: readonly(error),
        pagination: readonly(pagination),

        // Actions
        fetchPosts,
        fetchPostById,
        createPost,
        updatePost,
        deletePost,
        searchPosts
    }
})