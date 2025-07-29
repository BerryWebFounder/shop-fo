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

    // 통합 데이터 (공지사항 + 일반 게시글)
    const allPosts = ref([]) // 공지사항과 일반 게시글이 혼합된 목록
    const displayMode = ref('regular') // 'regular', 'all', 'notices-only'

    // fetchPostById 함수 (공지사항 지원 강화)
    const fetchPostById = async (id) => {
        if (!id || isNaN(id)) {
            error.value = '잘못된 게시글 ID입니다.'
            return
        }

        loading.value = true
        error.value = null
        currentPost.value = null

        try {
            console.log('=== fetchPostById 시작 ===')
            console.log('요청 ID:', id)

            // 통합 API를 사용하여 일반 게시글과 공지사항 모두 처리
            const response = await api.posts.getById(id)
            console.log('API 응답 원본:', response)

            if (!response) {
                throw new Error('응답이 비어있습니다.')
            }

            // 응답 구조 분석 및 처리
            let postData = null

            if (response.post || response.posts || response.notice) {
                // 래핑된 응답 구조
                console.log('래핑된 응답 구조 감지')
                postData = {
                    post: response.post || response.posts || response.notice,
                    commentCount: response.commentCount || 0,
                    fileCount: response.fileCount || 0,
                    comments: response.comments || [],
                    files: response.files || []
                }
            } else if (response.id) {
                // 직접 게시글 객체 응답
                console.log('직접 게시글 객체 응답 감지')
                postData = {
                    post: response,
                    commentCount: 0,
                    fileCount: 0,
                    comments: [],
                    files: []
                }
            } else if (response.data) {
                // data 래핑 응답
                console.log('data 래핑 응답 감지')
                const data = response.data
                postData = {
                    post: data.post || data,
                    commentCount: data.commentCount || 0,
                    fileCount: data.fileCount || 0,
                    comments: data.comments || [],
                    files: data.files || []
                }
            } else {
                console.error('알 수 없는 응답 구조:', response)
                throw new Error('알 수 없는 응답 형식입니다.')
            }

            console.log('처리된 게시글 데이터:', postData)

            // 게시글 기본 정보 검증
            if (!postData.post || !postData.post.id) {
                console.error('게시글 기본 정보가 없습니다:', postData)
                throw new Error('게시글 정보가 올바르지 않습니다.')
            }

            // 공지사항 여부 표시 (로그)
            if (postData.post.isNotice) {
                console.log('공지사항 로드됨:', {
                    title: postData.post.title,
                    isPinned: postData.post.isPinned,
                    isActive: postData.post.isActive,
                    expiryDate: postData.post.expiryDate
                })
            } else {
                console.log('일반 게시글 로드됨:', postData.post.title)
            }

            currentPost.value = postData
            console.log('currentPost 설정 완료:', currentPost.value)

        } catch (err) {
            console.error('=== fetchPostById 오류 ===')
            console.error('오류 타입:', err.constructor.name)
            console.error('오류 메시지:', err.message)
            console.error('전체 오류:', err)

            if (err.response?.status === 404) {
                error.value = '게시글을 찾을 수 없습니다.'
            } else if (err.response?.status === 500) {
                error.value = '서버 오류가 발생했습니다.'
            } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
                error.value = '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.'
            } else {
                error.value = err.message || '게시글을 불러오는데 실패했습니다.'
            }
        } finally {
            loading.value = false
            console.log('=== fetchPostById 완료 ===')
        }
    }

    // 일반 게시글만 조회 (기존 방식 유지)
    const fetchPosts = async (page = 0, size = 10) => {
        loading.value = true
        error.value = null

        try {
            console.log('Fetching regular posts...', { page, size })
            const response = await api.posts.getAll({ page, size })
            console.log('Regular posts response:', response)

            posts.value = response.content || []
            pagination.value = {
                page: response.number || 0,
                size: response.size || size,
                totalPages: response.totalPages || 0,
                totalElements: response.totalElements || 0
            }

            displayMode.value = 'regular'
            console.log(`Loaded ${posts.value.length} regular posts`)

        } catch (err) {
            console.error('Error fetching regular posts:', err)
            error.value = err.message || '게시글을 불러오는데 실패했습니다.'
            posts.value = []
        } finally {
            loading.value = false
        }
    }

    // 전체 게시글 조회 (공지사항 + 일반 게시글)
    const fetchAllPosts = async (page = 0, size = 10) => {
        loading.value = true
        error.value = null

        try {
            console.log('Fetching all posts (notices + regular)...', { page, size })
            const response = await api.posts.getAllWithNotices({ page, size })
            console.log('All posts response:', response)

            allPosts.value = response.content || []
            pagination.value = {
                page: response.number || 0,
                size: response.size || size,
                totalPages: response.totalPages || 0,
                totalElements: response.totalElements || 0
            }

            displayMode.value = 'all'
            console.log(`Loaded ${allPosts.value.length} total posts (notices + regular)`)

            // 공지사항과 일반 게시글 분리 (필요시)
            const notices = allPosts.value.filter(post => post.isNotice)
            const regularPosts = allPosts.value.filter(post => !post.isNotice)

            console.log(`- 공지사항: ${notices.length}개`)
            console.log(`- 일반 게시글: ${regularPosts.length}개`)

        } catch (err) {
            console.error('Error fetching all posts:', err)
            error.value = err.message || '게시글을 불러오는데 실패했습니다.'
            allPosts.value = []
        } finally {
            loading.value = false
        }
    }

    // 게시글 생성 (공지사항 지원 강화)
    const createPost = async (postData) => {
        if (!postData.title || !postData.content || !postData.author) {
            throw new Error('제목, 내용, 작성자는 필수입니다.')
        }

        loading.value = true
        error.value = null

        try {
            console.log('Creating post with data:', postData)

            // 공지사항 클라이언트 검증
            if (postData.isNotice) {
                const validation = api.utils.validateNotice(postData)
                if (!validation.valid) {
                    throw new Error(validation.errors.join(', '))
                }
                console.log('공지사항 생성 요청:', {
                    title: postData.title,
                    isPinned: postData.isPinned,
                    isActive: postData.isActive,
                    expiryDate: postData.expiryDate
                })
            } else {
                console.log('일반 게시글 생성 요청:', postData.title)
            }

            const response = await api.posts.create(postData)
            console.log('Create post API response:', response)

            // 백엔드 응답 구조 확인 및 처리
            let newPost = null

            if (response.id) {
                newPost = response
            } else if (response.post && response.post.id) {
                newPost = response.post
            } else if (response.data && response.data.id) {
                newPost = response.data
            } else {
                console.error('Unexpected response structure:', response)
                throw new Error('게시글 생성 응답 형식이 올바르지 않습니다.')
            }

            console.log('Processed new post:', newPost)

            if (!newPost.id || isNaN(newPost.id)) {
                throw new Error('생성된 게시글의 ID가 유효하지 않습니다.')
            }

            // 생성된 게시글을 적절한 목록에 추가
            if (displayMode.value === 'all') {
                allPosts.value.unshift(newPost)
            } else if (!newPost.isNotice) {
                // 일반 게시글만 표시하는 모드에서는 일반 게시글만 추가
                posts.value.unshift(newPost)
            }

            // 성공 로그
            if (newPost.isNotice) {
                console.log('공지사항 생성 완료:', {
                    id: newPost.id,
                    title: newPost.title,
                    isPinned: newPost.isPinned
                })
            } else {
                console.log('일반 게시글 생성 완료:', newPost.id)
            }

            return newPost
        } catch (err) {
            console.error('Error creating post:', err)
            error.value = err.message || '게시글 작성에 실패했습니다.'
            throw err
        } finally {
            loading.value = false
        }
    }

    // 게시글 수정 (공지사항 지원)
    const updatePost = async (id, postData) => {
        if (!id || (!postData.title && !postData.content)) {
            throw new Error('필수 정보가 누락되었습니다.')
        }

        loading.value = true
        error.value = null

        try {
            console.log('Updating post:', id, postData)

            // 현재 게시글 정보 확인
            const existingPost = currentPost.value?.post
            const isNotice = existingPost?.isNotice || postData.isNotice

            if (isNotice) {
                console.log('공지사항 수정:', {
                    id,
                    title: postData.title,
                    isPinned: postData.isPinned,
                    isActive: postData.isActive
                })
            }

            const updatedPost = await api.posts.update(id, postData)
            console.log('Updated post:', updatedPost)

            // 목록에서 해당 게시글 업데이트
            const updateInList = (list) => {
                const index = list.findIndex(p => p.id === id)
                if (index !== -1) {
                    list[index] = updatedPost
                }
            }

            updateInList(posts.value)
            updateInList(allPosts.value)

            // 현재 게시글이 업데이트된 게시글이라면 갱신
            if (currentPost.value?.post?.id === id) {
                currentPost.value = {
                    ...currentPost.value,
                    post: updatedPost
                }
            }

            console.log('게시글 수정 완료:', id)
            return updatedPost
        } catch (err) {
            console.error('Error updating post:', err)
            error.value = err.message || '게시글 수정에 실패했습니다.'
            throw err
        } finally {
            loading.value = false
        }
    }

    // 게시글 삭제
    const deletePost = async (id) => {
        if (!id) {
            throw new Error('게시글 ID가 필요합니다.')
        }

        loading.value = true
        error.value = null

        try {
            console.log('Deleting post:', id)

            // 삭제 전 게시글 정보 확인 (로그용)
            const targetPost = [...posts.value, ...allPosts.value].find(p => p.id === id)
            if (targetPost?.isNotice) {
                console.log('공지사항 삭제:', { id, title: targetPost.title })
            } else {
                console.log('일반 게시글 삭제:', id)
            }

            await api.posts.delete(id)
            console.log('Post deleted successfully')

            // 모든 목록에서 제거
            posts.value = posts.value.filter(p => p.id !== id)
            allPosts.value = allPosts.value.filter(p => p.id !== id)

            // 현재 게시글이 삭제된 게시글이라면 초기화
            if (currentPost.value?.post?.id === id) {
                currentPost.value = null
            }

        } catch (err) {
            console.error('Error deleting post:', err)
            error.value = err.message || '게시글 삭제에 실패했습니다.'
            throw err
        } finally {
            loading.value = false
        }
    }

    // 검색 (공지사항 포함)
    const searchPosts = async (searchParams, page = 0, size = 10) => {
        loading.value = true
        error.value = null

        try {
            console.log('Searching posts:', searchParams, { page, size })

            const finalParams = {
                ...searchParams,
                page,
                size
            }

            console.log('Final search params:', finalParams)

            const response = await api.posts.search(finalParams)
            console.log('Search response:', response)

            // 검색 결과에 따라 적절한 상태 업데이트
            if (displayMode.value === 'all') {
                allPosts.value = response.content || []
            } else {
                posts.value = response.content || []
            }

            pagination.value = {
                page: response.number || 0,
                size: response.size || size,
                totalPages: response.totalPages || 0,
                totalElements: response.totalElements || 0
            }

            console.log(`검색 완료: ${(response.content || []).length}개 결과`)

        } catch (err) {
            console.error('Error searching posts:', err)
            error.value = err.message || '검색에 실패했습니다.'

            // 검색 실패 시 빈 결과로 설정
            if (displayMode.value === 'all') {
                allPosts.value = []
            } else {
                posts.value = []
            }

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

    // 검색 메서드들 (기존 유지)
    const searchPostsByAuthor = async (author, page = 0, size = 10) => {
        console.log('Searching posts by author:', author)
        return await searchPosts({ author }, page, size)
    }

    const searchPostsByTitle = async (title, page = 0, size = 10) => {
        console.log('Searching posts by title:', title)
        return await searchPosts({ title }, page, size)
    }

    const searchPostsByContent = async (content, page = 0, size = 10) => {
        console.log('Searching posts by content:', content)
        return await searchPosts({ content }, page, size)
    }

    // Getters (computed)
    const currentPosts = computed(() => {
        return displayMode.value === 'all' ? allPosts.value : posts.value
    })

    const regularPosts = computed(() => {
        return currentPosts.value.filter(post => !post.isNotice)
    })

    const noticePosts = computed(() => {
        return currentPosts.value.filter(post => post.isNotice)
    })

    const pinnedNotices = computed(() => {
        return noticePosts.value.filter(post => post.isPinned && post.isActive)
    })

    const regularNotices = computed(() => {
        return noticePosts.value.filter(post => !post.isPinned && post.isActive)
    })

    const hasNotices = computed(() => noticePosts.value.length > 0)
    const hasPinnedNotices = computed(() => pinnedNotices.value.length > 0)

    // 현재 게시글이 공지사항인지 확인
    const isCurrentPostNotice = computed(() => {
        return currentPost.value?.post?.isNotice === true
    })

    // 표시 모드 변경
    const setDisplayMode = (mode) => {
        console.log('Display mode changed:', displayMode.value, '→', mode)
        displayMode.value = mode
    }

    // 상태 초기화 함수
    const clearCurrentPost = () => {
        currentPost.value = null
        error.value = null
    }

    const clearError = () => {
        error.value = null
    }

    const clearAll = () => {
        posts.value = []
        allPosts.value = []
        currentPost.value = null
        error.value = null
        pagination.value = { page: 0, size: 10, totalPages: 0, totalElements: 0 }
        displayMode.value = 'regular'
    }

    return {
        // State
        posts: readonly(posts),
        allPosts: readonly(allPosts),
        currentPost: readonly(currentPost),
        loading: readonly(loading),
        error: readonly(error),
        pagination: readonly(pagination),
        displayMode: readonly(displayMode),

        // Getters
        currentPosts,
        regularPosts,
        noticePosts,
        pinnedNotices,
        regularNotices,
        hasNotices,
        hasPinnedNotices,
        isCurrentPostNotice,

        // Actions - 기본 CRUD
        fetchPosts,
        fetchAllPosts,
        fetchPostById,
        createPost,
        updatePost,
        deletePost,

        // Actions - 검색
        searchPosts,
        searchPostsByAuthor,
        searchPostsByTitle,
        searchPostsByContent,

        // Actions - 상태 관리
        setDisplayMode,
        clearCurrentPost,
        clearError,
        clearAll
    }
})