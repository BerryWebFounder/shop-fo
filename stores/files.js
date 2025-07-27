export const useFileStore = defineStore('files', () => {
    // API 초기화를 지연시켜 에러 방지
    let api = null

    const initializeApi = () => {
        if (!api) {
            try {
                api = useApi()
            } catch (error) {
                console.error('Failed to initialize API:', error)
                return null
            }
        }
        return api
    }

    // State
    const files = ref([])
    const loading = ref(false)
    const error = ref(null)
    const uploadProgress = ref(0)

    // Actions
    const fetchFilesByPostId = async (postId) => {
        if (!postId) {
            console.warn('fetchFilesByPostId: postId is required')
            return
        }

        const apiInstance = initializeApi()
        if (!apiInstance) {
            error.value = 'API 초기화에 실패했습니다.'
            return
        }

        loading.value = true
        error.value = null

        try {
            console.log('Fetching files for post:', postId)
            const response = await apiInstance.files.getByPostId(postId)
            console.log('Files fetched:', response)

            files.value = Array.isArray(response) ? response : []
        } catch (err) {
            console.error('Error fetching files:', err)
            error.value = err.message
            files.value = []
        } finally {
            loading.value = false
        }
    }

    const uploadFiles = async (postId, fileList) => {
        if (!postId) {
            throw new Error('게시글 ID가 필요합니다.')
        }

        if (!fileList || fileList.length === 0) {
            throw new Error('업로드할 파일이 없습니다.')
        }

        const apiInstance = initializeApi()
        if (!apiInstance) {
            throw new Error('API 초기화에 실패했습니다.')
        }

        loading.value = true
        error.value = null
        uploadProgress.value = 0

        try {
            console.log('Uploading files:', { postId, fileCount: fileList.length })

            // FormData 생성
            const formData = new FormData()

            // 파일 배열이나 FileList를 배열로 변환
            const filesArray = Array.isArray(fileList) ? fileList : Array.from(fileList)

            filesArray.forEach((file, index) => {
                console.log(`Adding file ${index + 1}:`, file.name, file.size)
                formData.append('files', file) // 'files'로 변경 (복수형)
            })

            // 파일 업로드 실행
            const response = await apiInstance.files.upload(postId, formData)
            console.log('Upload response:', response)

            // 업로드 후 파일 목록 새로고침
            await fetchFilesByPostId(postId)

            uploadProgress.value = 100
            return response

        } catch (err) {
            console.error('Error uploading files:', err)
            error.value = err.message || '파일 업로드에 실패했습니다.'
            throw err
        } finally {
            loading.value = false
            // 진행률 초기화는 약간의 지연 후
            setTimeout(() => {
                uploadProgress.value = 0
            }, 1000)
        }
    }

    const uploadSingleFile = async (postId, file) => {
        return await uploadFiles(postId, [file])
    }

    const deleteFile = async (fileId, postId) => {
        if (!fileId) {
            throw new Error('파일 ID가 필요합니다.')
        }

        const apiInstance = initializeApi()
        if (!apiInstance) {
            throw new Error('API 초기화에 실패했습니다.')
        }

        loading.value = true
        error.value = null

        try {
            console.log('Deleting file:', fileId)
            await apiInstance.files.delete(fileId)
            console.log('File deleted successfully')

            // 로컬 상태에서 파일 제거
            files.value = files.value.filter(file => file.id !== fileId)

            // postId가 있으면 전체 목록 새로고침 (선택사항)
            if (postId) {
                await fetchFilesByPostId(postId)
            }

        } catch (err) {
            console.error('Error deleting file:', err)
            error.value = err.message || '파일 삭제에 실패했습니다.'
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteMultipleFiles = async (fileIds, postId) => {
        if (!fileIds || fileIds.length === 0) {
            throw new Error('삭제할 파일이 없습니다.')
        }

        const apiInstance = initializeApi()
        if (!apiInstance) {
            throw new Error('API 초기화에 실패했습니다.')
        }

        loading.value = true
        error.value = null

        try {
            console.log('Deleting multiple files:', fileIds)

            // 병렬로 삭제 처리
            const deletePromises = fileIds.map(fileId => apiInstance.files.delete(fileId))
            await Promise.all(deletePromises)

            console.log('Multiple files deleted successfully')

            // 로컬 상태에서 파일들 제거
            files.value = files.value.filter(file => !fileIds.includes(file.id))

            // postId가 있으면 전체 목록 새로고침
            if (postId) {
                await fetchFilesByPostId(postId)
            }

        } catch (err) {
            console.error('Error deleting multiple files:', err)
            error.value = err.message || '파일 삭제에 실패했습니다.'
            throw err
        } finally {
            loading.value = false
        }
    }

    const getDownloadUrl = (storedName) => {
        if (!storedName) {
            console.warn('getDownloadUrl: storedName is required')
            return ''
        }

        const apiInstance = initializeApi()
        if (!apiInstance) {
            console.error('Cannot get download URL: API not initialized')
            return ''
        }

        return apiInstance.files.getDownloadUrl(storedName)
    }

    const validateFile = (file, options = {}) => {
        const {
            maxSize = 10 * 1024 * 1024, // 10MB 기본값
            allowedTypes = [],
            allowedExtensions = []
        } = options

        const errors = []

        // 파일 크기 검사
        if (file.size > maxSize) {
            errors.push(`파일 크기가 ${formatFileSize(maxSize)}를 초과합니다.`)
        }

        // MIME 타입 검사
        if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
            errors.push('지원하지 않는 파일 형식입니다.')
        }

        // 확장자 검사
        if (allowedExtensions.length > 0) {
            const extension = file.name.split('.').pop()?.toLowerCase()
            if (!allowedExtensions.includes(extension)) {
                errors.push('지원하지 않는 파일 확장자입니다.')
            }
        }

        return {
            valid: errors.length === 0,
            errors
        }
    }

    const validateFiles = (fileList, options = {}) => {
        const filesArray = Array.isArray(fileList) ? fileList : Array.from(fileList)
        const results = filesArray.map(file => ({
            file,
            ...validateFile(file, options)
        }))

        const validFiles = results.filter(r => r.valid).map(r => r.file)
        const invalidFiles = results.filter(r => !r.valid)

        return {
            validFiles,
            invalidFiles,
            allValid: invalidFiles.length === 0
        }
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const getFileType = (fileName) => {
        if (!fileName) return 'unknown'

        const extension = fileName.split('.').pop()?.toLowerCase()

        const typeMap = {
            // 이미지
            jpg: 'image', jpeg: 'image', png: 'image', gif: 'image',
            bmp: 'image', svg: 'image', webp: 'image',

            // 문서
            pdf: 'pdf', doc: 'document', docx: 'document',
            txt: 'text', rtf: 'document', odt: 'document',

            // 스프레드시트
            xls: 'spreadsheet', xlsx: 'spreadsheet', csv: 'spreadsheet', ods: 'spreadsheet',

            // 프레젠테이션
            ppt: 'presentation', pptx: 'presentation', odp: 'presentation',

            // 압축
            zip: 'archive', rar: 'archive', '7z': 'archive',
            tar: 'archive', gz: 'archive', bz2: 'archive',

            // 코드
            js: 'code', html: 'code', css: 'code', json: 'code',
            xml: 'code', php: 'code', py: 'code', java: 'code',

            // 오디오
            mp3: 'audio', wav: 'audio', flac: 'audio', aac: 'audio',

            // 비디오
            mp4: 'video', avi: 'video', mov: 'video', mkv: 'video', wmv: 'video'
        }

        return typeMap[extension] || 'unknown'
    }

    const clearFiles = () => {
        files.value = []
        error.value = null
        uploadProgress.value = 0
    }

    const clearError = () => {
        error.value = null
    }

    // 파일 통계 계산
    const fileStats = computed(() => {
        const totalFiles = files.value.length
        const totalSize = files.value.reduce((sum, file) => sum + (file.fileSize || 0), 0)

        const typeStats = files.value.reduce((stats, file) => {
            const type = getFileType(file.originalName)
            stats[type] = (stats[type] || 0) + 1
            return stats
        }, {})

        return {
            totalFiles,
            totalSize,
            totalSizeFormatted: formatFileSize(totalSize),
            typeStats
        }
    })

    return {
        // State
        files: readonly(files),
        loading: readonly(loading),
        error: readonly(error),
        uploadProgress: readonly(uploadProgress),
        fileStats,

        // Actions
        fetchFilesByPostId,
        uploadFiles,
        uploadSingleFile,
        deleteFile,
        deleteMultipleFiles,
        getDownloadUrl,
        validateFile,
        validateFiles,
        formatFileSize,
        getFileType,
        clearFiles,
        clearError
    }
})