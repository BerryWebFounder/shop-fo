export const useFileStore = defineStore('files', () => {
    const api = useApi()

    // State
    const files = ref([])
    const loading = ref(false)
    const error = ref(null)

    // Actions
    const fetchFilesByPostId = async (postId) => {
        loading.value = true
        error.value = null

        try {
            const response = await api.files.getByPostId(postId)
            files.value = response
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    const uploadFiles = async (postId, fileList) => {
        loading.value = true
        error.value = null

        try {
            const formData = new FormData()
            Array.from(fileList).forEach(file => {
                formData.append('file', file)
            })

            const response = await api.files.upload(postId, formData)
            // 업로드 후 파일 목록 새로고침
            await fetchFilesByPostId(postId)
            return response
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteFile = async (fileId, postId) => {
        loading.value = true
        error.value = null

        try {
            await api.files.delete(fileId)
            // 삭제 후 파일 목록 새로고침
            await fetchFilesByPostId(postId)
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const getDownloadUrl = (storedName) => {
        return api.files.getDownloadUrl(storedName)
    }

    return {
        // State
        files: readonly(files),
        loading: readonly(loading),
        error: readonly(error),

        // Actions
        fetchFilesByPostId,
        uploadFiles,
        deleteFile,
        getDownloadUrl
    }
})