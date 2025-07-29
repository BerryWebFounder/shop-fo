// stores/notices.js
export const useNoticeStore = defineStore('notices', () => {
    const api = useApi()

    // State
    const notices = ref([])
    const currentNotice = ref(null)
    const loading = ref(false)
    const error = ref(null)
    const pagination = ref({
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0
    })

    // 공지사항 타입별 상태
    const activeNotices = ref([])
    const pinnedNotices = ref([])
    const regularNotices = ref([])
    const expiredNotices = ref([])

    // 통계 정보
    const stats = ref({
        total: 0,
        active: 0,
        pinned: 0,
        expired: 0,
        expiringSoon: 0
    })

    // Actions - 기본 CRUD
    const fetchNotices = async (page = 0, size = 10, includeInactive = false) => {
        loading.value = true
        error.value = null

        try {
            console.log('Fetching notices:', { page, size, includeInactive })

            const endpoint = includeInactive ? 'admin.notices.getAll' : 'notices.getAll'
            const response = await (includeInactive
                    ? api.admin.notices.getAll({ page, size })
                    : api.notices.getAll({ page, size })
            )

            console.log('Notices response:', response)

            notices.value = response.content || []
            pagination.value = {
                page: response.number || 0,
                size: response.size || size,
                totalPages: response.totalPages || 0,
                totalElements: response.totalElements || 0
            }

            console.log(`Loaded ${notices.value.length} notices`)

        } catch (err) {
            console.error('Error fetching notices:', err)
            error.value = err.message || '공지사항을 불러오는데 실패했습니다.'
            notices.value = []
        } finally {
            loading.value = false
        }
    }

    const fetchNoticeById = async (id) => {
        if (!id || isNaN(id)) {
            error.value = '잘못된 공지사항 ID입니다.'
            return
        }

        loading.value = true
        error.value = null
        currentNotice.value = null

        try {
            console.log('Fetching notice by ID:', id)
            const response = await api.notices.getById(id)
            console.log('Notice response:', response)

            if (!response) {
                throw new Error('공지사항 응답이 비어있습니다.')
            }

            // 응답 구조 처리 (posts와 동일한 로직)
            let noticeData = null

            if (response.notice || response.post) {
                noticeData = {
                    notice: response.notice || response.post,
                    commentCount: response.commentCount || 0,
                    fileCount: response.fileCount || 0,
                    comments: response.comments || [],
                    files: response.files || []
                }
            } else if (response.id) {
                noticeData = {
                    notice: response,
                    commentCount: 0,
                    fileCount: 0,
                    comments: [],
                    files: []
                }
            } else {
                throw new Error('알 수 없는 응답 형식입니다.')
            }

            // 공지사항 여부 확인
            if (!noticeData.notice.isNotice) {
                throw new Error('해당 게시글은 공지사항이 아닙니다.')
            }

            currentNotice.value = noticeData
            console.log('Current notice set:', currentNotice.value)

        } catch (err) {
            console.error('Error fetching notice:', err)
            error.value = err.message || '공지사항을 불러오는데 실패했습니다.'
        } finally {
            loading.value = false
        }
    }

    const createNotice = async (noticeData) => {
        if (!noticeData.title || !noticeData.content || !noticeData.author) {
            throw new Error('제목, 내용, 작성자는 필수입니다.')
        }

        loading.value = true
        error.value = null

        try {
            console.log('Creating notice:', noticeData)

            // 클라이언트 사이드 검증
            const validation = api.utils.validateNotice(noticeData)
            if (!validation.valid) {
                throw new Error(validation.errors.join(', '))
            }

            const newNotice = await api.notices.create(noticeData)
            console.log('Notice created:', newNotice)

            // 목록에 추가 (최신 순)
            notices.value.unshift(newNotice)

            // 활성 공지사항 목록 갱신
            if (newNotice.isActive) {
                await fetchActiveNotices()
            }

            return newNotice
        } catch (err) {
            console.error('Error creating notice:', err)
            error.value = err.message || '공지사항 작성에 실패했습니다.'
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateNotice = async (id, noticeData) => {
        if (!id || !noticeData.title || !noticeData.content) {
            throw new Error('필수 정보가 누락되었습니다.')
        }

        loading.value = true
        error.value = null

        try {
            console.log('Updating notice:', id, noticeData)

            const updatedNotice = await api.notices.update(id, noticeData)
            console.log('Notice updated:', updatedNotice)

            // 목록에서 업데이트
            const index = notices.value.findIndex(n => n.id === id)
            if (index !== -1) {
                notices.value[index] = updatedNotice
            }

            // 현재 공지사항이 업데이트된 공지사항이라면 갱신
            if (currentNotice.value?.notice?.id === id) {
                currentNotice.value = {
                    ...currentNotice.value,
                    notice: updatedNotice
                }
            }

            // 활성 공지사항 목록 갱신
            await fetchActiveNotices()

            return updatedNotice
        } catch (err) {
            console.error('Error updating notice:', err)
            error.value = err.message || '공지사항 수정에 실패했습니다.'
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteNotice = async (id) => {
        if (!id) {
            throw new Error('공지사항 ID가 필요합니다.')
        }

        loading.value = true
        error.value = null

        try {
            console.log('Deleting notice:', id)
            await api.notices.delete(id)
            console.log('Notice deleted successfully')

            // 목록에서 제거
            notices.value = notices.value.filter(n => n.id !== id)

            // 현재 공지사항이 삭제된 공지사항이라면 초기화
            if (currentNotice.value?.notice?.id === id) {
                currentNotice.value = null
            }

            // 활성 공지사항 목록 갱신
            await fetchActiveNotices()

        } catch (err) {
            console.error('Error deleting notice:', err)
            error.value = err.message || '공지사항 삭제에 실패했습니다.'
            throw err
        } finally {
            loading.value = false
        }
    }

    // Actions - 특수 조회
    const fetchActiveNotices = async () => {
        try {
            console.log('Fetching active notices')
            const response = await api.notices.getActive()
            activeNotices.value = Array.isArray(response) ? response : response.content || []
            console.log(`Loaded ${activeNotices.value.length} active notices`)
        } catch (err) {
            console.error('Error fetching active notices:', err)
            activeNotices.value = []
        }
    }

    const fetchPinnedNotices = async () => {
        try {
            console.log('Fetching pinned notices')
            const response = await api.notices.getPinned()
            pinnedNotices.value = Array.isArray(response) ? response : []
            console.log(`Loaded ${pinnedNotices.value.length} pinned notices`)
        } catch (err) {
            console.error('Error fetching pinned notices:', err)
            pinnedNotices.value = []
        }
    }

    const fetchRegularNotices = async () => {
        try {
            console.log('Fetching regular notices')
            const response = await api.notices.getRegular()
            regularNotices.value = Array.isArray(response) ? response : []
            console.log(`Loaded ${regularNotices.value.length} regular notices`)
        } catch (err) {
            console.error('Error fetching regular notices:', err)
            regularNotices.value = []
        }
    }

    const fetchExpiredNotices = async () => {
        try {
            console.log('Fetching expired notices')
            const response = await api.admin.notices.getExpired()
            expiredNotices.value = response.notices || []
            console.log(`Loaded ${expiredNotices.value.length} expired notices`)
        } catch (err) {
            console.error('Error fetching expired notices:', err)
            expiredNotices.value = []
        }
    }

    // 메인 페이지용 공지사항 로드 (제한된 개수)
    const fetchNoticesForMainPage = async () => {
        try {
            console.log('Fetching notices for main page')

            // 중요 공지사항과 일반 공지사항을 병렬로 로드
            const [pinned, regular] = await Promise.all([
                api.notices.getPinned(),
                api.notices.getRegular()
            ])

            pinnedNotices.value = Array.isArray(pinned) ? pinned : []

            // 일반 공지사항은 최대 3개만 표시 (중요 공지사항 + 일반 공지사항 합쳐서 최대 5개)
            const maxRegular = Math.max(0, 5 - pinnedNotices.value.length)
            regularNotices.value = Array.isArray(regular) ? regular.slice(0, maxRegular) : []

            console.log(`Loaded for main page: ${pinnedNotices.value.length} pinned, ${regularNotices.value.length} regular`)

            return {
                pinned: pinnedNotices.value,
                regular: regularNotices.value
            }
        } catch (err) {
            console.error('Error fetching notices for main page:', err)
            pinnedNotices.value = []
            regularNotices.value = []
            return { pinned: [], regular: [] }
        }
    }

    // Actions - 상태 관리
    const toggleNoticeStatus = async (id) => {
        if (!id) {
            throw new Error('공지사항 ID가 필요합니다.')
        }

        loading.value = true
        error.value = null

        try {
            console.log('Toggling notice status:', id)
            const updatedNotice = await api.notices.toggleStatus(id)
            console.log('Notice status toggled:', updatedNotice)

            // 목록에서 업데이트
            const index = notices.value.findIndex(n => n.id === id)
            if (index !== -1) {
                notices.value[index] = updatedNotice
            }

            // 현재 공지사항 업데이트
            if (currentNotice.value?.notice?.id === id) {
                currentNotice.value.notice = updatedNotice
            }

            // 활성 공지사항 목록 갱신
            await fetchActiveNotices()

            return updatedNotice
        } catch (err) {
            console.error('Error toggling notice status:', err)
            error.value = err.message || '공지사항 상태 변경에 실패했습니다.'
            throw err
        } finally {
            loading.value = false
        }
    }

    // Actions - 검색
    const searchNotices = async (searchParams, page = 0, size = 10) => {
        loading.value = true
        error.value = null

        try {
            console.log('Searching notices:', searchParams)

            const finalParams = {
                ...searchParams,
                page,
                size
            }

            const response = await api.notices.search(finalParams)
            console.log('Search response:', response)

            notices.value = response.content || []
            pagination.value = {
                page: response.number || 0,
                size: response.size || size,
                totalPages: response.totalPages || 0,
                totalElements: response.totalElements || 0
            }

            console.log(`Search completed: ${notices.value.length} results`)

        } catch (err) {
            console.error('Error searching notices:', err)
            error.value = err.message || '공지사항 검색에 실패했습니다.'
            notices.value = []
            pagination.value = {
                page: 0,
                size: size,
                totalPages: 0,
                totalElements: 0
            }
        } finally {
            loading.value = false
        }
    }

    // Actions - 통계
    const fetchStats = async () => {
        try {
            console.log('Fetching notice statistics')
            const response = await api.notices.getStats()
            stats.value = {
                total: response.total || 0,
                active: response.active || 0,
                pinned: response.pinned || 0,
                expired: response.expired || 0,
                expiringSoon: response.expiringSoon || 0
            }
            console.log('Stats loaded:', stats.value)
        } catch (err) {
            console.error('Error fetching stats:', err)
            stats.value = { total: 0, active: 0, pinned: 0, expired: 0, expiringSoon: 0 }
        }
    }

    // Actions - 관리자 기능
    const batchUpdateStatus = async (noticeIds, isActive) => {
        loading.value = true
        error.value = null

        try {
            console.log('Batch updating notice status:', { noticeIds, isActive })
            const response = await api.admin.notices.batchUpdateStatus({ noticeIds, isActive })
            console.log('Batch update result:', response)

            // 목록 새로고침
            await fetchNotices(pagination.value.page, pagination.value.size, true)
            await fetchActiveNotices()

            return response
        } catch (err) {
            console.error('Error in batch update:', err)
            error.value = err.message || '일괄 상태 변경에 실패했습니다.'
            throw err
        } finally {
            loading.value = false
        }
    }

    const batchDelete = async (noticeIds) => {
        loading.value = true
        error.value = null

        try {
            console.log('Batch deleting notices:', noticeIds)
            const response = await api.admin.notices.batchDelete({ noticeIds })
            console.log('Batch delete result:', response)

            // 목록에서 제거
            notices.value = notices.value.filter(notice => !noticeIds.includes(notice.id))

            // 활성 공지사항 목록 갱신
            await fetchActiveNotices()

            return response
        } catch (err) {
            console.error('Error in batch delete:', err)
            error.value = err.message || '일괄 삭제에 실패했습니다.'
            throw err
        } finally {
            loading.value = false
        }
    }

    const cleanupExpiredNotices = async () => {
        loading.value = true
        error.value = null

        try {
            console.log('Cleaning up expired notices')
            const response = await api.admin.notices.cleanupExpired()
            console.log('Cleanup result:', response)

            // 통계 새로고침
            await fetchStats()

            return response
        } catch (err) {
            console.error('Error cleaning up expired notices:', err)
            error.value = err.message || '만료된 공지사항 정리에 실패했습니다.'
            throw err
        } finally {
            loading.value = false
        }
    }

    // Getters (computed)
    const activeNoticeCount = computed(() => activeNotices.value.length)
    const pinnedNoticeCount = computed(() => pinnedNotices.value.length)
    const regularNoticeCount = computed(() => regularNotices.value.length)

    const hasActiveNotices = computed(() => activeNotices.value.length > 0)
    const hasPinnedNotices = computed(() => pinnedNotices.value.length > 0)

    // 공지사항 유효성 검사 헬퍼
    const isValidNotice = (notice) => {
        return notice &&
            notice.isNotice === true &&
            notice.isActive === true &&
            !api.utils.isExpiredNotice(notice)
    }

    // 상태 초기화
    const clearCurrentNotice = () => {
        currentNotice.value = null
        error.value = null
    }

    const clearError = () => {
        error.value = null
    }

    const clearAll = () => {
        notices.value = []
        currentNotice.value = null
        activeNotices.value = []
        pinnedNotices.value = []
        regularNotices.value = []
        expiredNotices.value = []
        error.value = null
        stats.value = { total: 0, active: 0, pinned: 0, expired: 0, expiringSoon: 0 }
        pagination.value = { page: 0, size: 10, totalPages: 0, totalElements: 0 }
    }

    return {
        // State
        notices: readonly(notices),
        currentNotice: readonly(currentNotice),
        loading: readonly(loading),
        error: readonly(error),
        pagination: readonly(pagination),
        activeNotices: readonly(activeNotices),
        pinnedNotices: readonly(pinnedNotices),
        regularNotices: readonly(regularNotices),
        expiredNotices: readonly(expiredNotices),
        stats: readonly(stats),

        // Getters
        activeNoticeCount,
        pinnedNoticeCount,
        regularNoticeCount,
        hasActiveNotices,
        hasPinnedNotices,

        // Actions - 기본 CRUD
        fetchNotices,
        fetchNoticeById,
        createNotice,
        updateNotice,
        deleteNotice,

        // Actions - 특수 조회
        fetchActiveNotices,
        fetchPinnedNotices,
        fetchRegularNotices,
        fetchExpiredNotices,
        fetchNoticesForMainPage,

        // Actions - 상태 관리
        toggleNoticeStatus,

        // Actions - 검색
        searchNotices,

        // Actions - 통계
        fetchStats,

        // Actions - 관리자
        batchUpdateStatus,
        batchDelete,
        cleanupExpiredNotices,

        // Utilities
        isValidNotice,
        clearCurrentNotice,
        clearError,
        clearAll
    }
})