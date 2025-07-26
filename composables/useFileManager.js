export const useFileManager = () => {
    const fileStore = useFileStore()
    const modalStore = useModalStore()

    // 파일 타입별 설정
    const FILE_CONFIGS = {
        image: {
            maxSize: 5 * 1024 * 1024, // 5MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp']
        },
        document: {
            maxSize: 10 * 1024 * 1024, // 10MB
            allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            extensions: ['pdf', 'doc', 'docx']
        },
        archive: {
            maxSize: 50 * 1024 * 1024, // 50MB
            allowedTypes: ['application/zip', 'application/x-rar-compressed'],
            extensions: ['zip', 'rar']
        },
        general: {
            maxSize: 10 * 1024 * 1024, // 10MB
            allowedTypes: [],
            extensions: []
        }
    }

    // 파일 검증
    const validateFile = (file, config = FILE_CONFIGS.general) => {
        const errors = []

        // 크기 검증
        if (file.size > config.maxSize) {
            errors.push(`파일 크기가 ${formatFileSize(config.maxSize)}를 초과합니다.`)
        }

        // 타입 검증
        if (config.allowedTypes.length > 0) {
            const isTypeAllowed = config.allowedTypes.some(type => {
                if (type.endsWith('/*')) {
                    return file.type.startsWith(type.slice(0, -1))
                }
                return file.type === type
            })

            if (!isTypeAllowed) {
                errors.push('허용되지 않는 파일 형식입니다.')
            }
        }

        // 확장자 검증
        if (config.extensions.length > 0) {
            const extension = file.name.split('.').pop()?.toLowerCase()
            if (!config.extensions.includes(extension)) {
                errors.push('허용되지 않는 파일 확장자입니다.')
            }
        }

        return {
            valid: errors.length === 0,
            errors
        }
    }

    // 배치 파일 검증
    const validateFiles = (files, config = FILE_CONFIGS.general) => {
        const results = Array.from(files).map(file => ({
            file,
            ...validateFile(file, config)
        }))

        return {
            validFiles: results.filter(r => r.valid).map(r => r.file),
            invalidFiles: results.filter(r => !r.valid),
            allValid: results.every(r => r.valid)
        }
    }

    // 파일 압축 (클라이언트 사이드)
    const compressImage = async (file, quality = 0.8, maxWidth = 1920, maxHeight = 1080) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const img = new Image()

            img.onload = () => {
                // 비율 유지하면서 최대 크기 계산
                let { width, height } = img

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height)
                    width *= ratio
                    height *= ratio
                }

                canvas.width = width
                canvas.height = height

                // 이미지 그리기
                ctx.drawImage(img, 0, 0, width, height)

                // Blob으로 변환
                canvas.toBlob(resolve, file.type, quality)
            }

            img.src = URL.createObjectURL(file)
        })
    }

    // 파일 이름 정리
    const sanitizeFileName = (fileName) => {
        return fileName
            .replace(/[^a-zA-Z0-9가-힣._-]/g, '_') // 특수문자 제거
            .replace(/_{2,}/g, '_') // 연속 언더스코어 정리
            .substring(0, 100) // 길이 제한
    }

    // 중복 파일명 처리
    const generateUniqueFileName = (fileName, existingFiles = []) => {
        const baseName = fileName.substring(0, fileName.lastIndexOf('.'))
        const extension = fileName.substring(fileName.lastIndexOf('.'))

        let counter = 1
        let newFileName = fileName

        while (existingFiles.some(f => f.originalName === newFileName)) {
            newFileName = `${baseName}_${counter}${extension}`
            counter++
        }

        return newFileName
    }

    // 파일 크기 포맷팅
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // 업로드 진행률 시뮬레이션
    const createProgressSimulator = (duration = 2000) => {
        const progress = ref(0)
        let interval

        const start = () => {
            progress.value = 0
            interval = setInterval(() => {
                if (progress.value < 90) {
                    progress.value += Math.random() * 15
                }
            }, duration / 10)
        }

        const complete = () => {
            progress.value = 100
            if (interval) {
                clearInterval(interval)
            }
        }

        const reset = () => {
            progress.value = 0
            if (interval) {
                clearInterval(interval)
            }
        }

        return { progress: readonly(progress), start, complete, reset }
    }

    // 파일 드래그 앤 드롭 핸들러
    const createDropHandler = () => {
        const isDragOver = ref(false)
        const dragCounter = ref(0)

        const handleDragEnter = (e) => {
            e.preventDefault()
            dragCounter.value++
            isDragOver.value = true
        }

        const handleDragLeave = (e) => {
            e.preventDefault()
            dragCounter.value--
            if (dragCounter.value === 0) {
                isDragOver.value = false
            }
        }

        const handleDragOver = (e) => {
            e.preventDefault()
        }

        const handleDrop = (e) => {
            e.preventDefault()
            dragCounter.value = 0
            isDragOver.value = false

            const files = Array.from(e.dataTransfer.files)
            return files
        }

        return {
            isDragOver: readonly(isDragOver),
            handleDragEnter,
            handleDragLeave,
            handleDragOver,
            handleDrop
        }
    }

    // 파일 썸네일 생성
    const generateThumbnail = (file, size = 150) => {
        return new Promise((resolve) => {
            if (!file.type.startsWith('image/')) {
                resolve(null)
                return
            }

            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const img = new Image()

            img.onload = () => {
                canvas.width = size
                canvas.height = size

                // 정사각형으로 자르기
                const minDim = Math.min(img.width, img.height)
                const x = (img.width - minDim) / 2
                const y = (img.height - minDim) / 2

                ctx.drawImage(img, x, y, minDim, minDim, 0, 0, size, size)
                resolve(canvas.toDataURL())
            }

            img.onerror = () => resolve(null)
            img.src = URL.createObjectURL(file)
        })
    }

    // 파일 정보 분석
    const analyzeFile = async (file) => {
        const thumbnail = await generateThumbnail(file)

        return {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            thumbnail,
            category: getFileCategory(file.type),
            isImage: file.type.startsWith('image/'),
            isDocument: file.type.includes('pdf') || file.type.includes('document'),
            isArchive: file.type.includes('zip') || file.type.includes('rar')
        }
    }

    // 파일 카테고리 분류
    const getFileCategory = (mimeType) => {
        if (mimeType.startsWith('image/')) return 'image'
        if (mimeType.startsWith('video/')) return 'video'
        if (mimeType.startsWith('audio/')) return 'audio'
        if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document'
        if (mimeType.includes('zip') || mimeType.includes('rar')) return 'archive'
        if (mimeType.startsWith('text/')) return 'text'
        return 'other'
    }

    return {
        // 설정
        FILE_CONFIGS,

        // 검증
        validateFile,
        validateFiles,

        // 파일 처리
        compressImage,
        sanitizeFileName,
        generateUniqueFileName,
        generateThumbnail,
        analyzeFile,

        // 유틸리티
        formatFileSize,
        getFileCategory,
        createProgressSimulator,
        createDropHandler
    }
}