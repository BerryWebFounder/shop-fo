export const useCommentStore = defineStore('comments', () => {
    const api = useApi()

    // State
    const comments = ref([])
    const loading = ref(false)
    const error = ref(null)

    // Actions
    const fetchCommentsByPostId = async (postId) => {
        loading.value = true
        error.value = null

        try {
            const response = await api.comments.getByPostId(postId)
            comments.value = response
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    const createComment = async (commentData) => {
        loading.value = true
        error.value = null

        try {
            const newComment = await api.comments.create(commentData)
            comments.value.push(newComment)
            return newComment
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateComment = async (id, content) => {
        loading.value = true
        error.value = null

        try {
            const updatedComment = await api.comments.update(id, { content })
            const index = comments.value.findIndex(c => c.id === id)
            if (index !== -1) {
                comments.value[index] = updatedComment
            }
            return updatedComment
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteComment = async (id) => {
        loading.value = true
        error.value = null

        try {
            await api.comments.delete(id)
            comments.value = comments.value.filter(c => c.id !== id)
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        // State
        comments: readonly(comments),
        loading: readonly(loading),
        error: readonly(error),

        // Actions
        fetchCommentsByPostId,
        createComment,
        updateComment,
        deleteComment
    }
})