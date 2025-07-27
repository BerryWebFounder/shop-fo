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

    // stores/posts.js의 fetchPostById 함수 수정 버전

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
            console.log('API 기본 URL:', useRuntimeConfig().public.apiBaseUrl)

            // API 호출
            const response = await api.posts.getById(id)
            console.log('API 응답 원본:', response)

            if (!response) {
                throw new Error('응답이 비어있습니다.')
            }

            // 응답 구조 분석 및 처리
            let postData = null

            if (response.post || response.posts) {
                // 래핑된 응답 구조
                console.log('래핑된 응답 구조 감지')
                postData = {
                    post: response.post || response.posts,
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

            currentPost.value = postData
            console.log('currentPost 설정 완료:', currentPost.value)

        } catch (err) {
            console.error('=== fetchPostById 오류 ===')
            console.error('오류 타입:', err.constructor.name)
            console.error('오류 메시지:', err.message)
            console.error('HTTP 상태:', err.response?.status)
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
            console.log('최종 상태:', {
                loading: loading.value,
                error: error.value,
                hasPost: !!currentPost.value
            })
        }
    }

    const fetchPosts = async (page = 0, size = 10) => {
        loading.value = true
        error.value = null

        try {
            console.log('Fetching posts...', { page, size })
            const response = await api.posts.getAll({ page, size })
            console.log('Posts response:', response)

            posts.value = response.content || []
            pagination.value = {
                page: response.number || 0,
                size: response.size || size,
                totalPages: response.totalPages || 0,
                totalElements: response.totalElements || 0
            }
        } catch (err) {
            console.error('Error fetching posts:', err)
            error.value = err.message || '게시글을 불러오는데 실패했습니다.'
        } finally {
            loading.value = false
        }
    }

    const createPost = async (postData) => {
        if (!postData.title || !postData.content || !postData.author) {
            throw new Error('모든 필드를 입력해주세요.')
        }

        loading.value = true
        error.value = null

        try {
            console.log('Creating post with data:', postData)
            const response = await api.posts.create(postData)
            console.log('Create post API response:', response)

            // 백엔드 응답 구조 확인 및 처리
            let newPost = null

            if (response.id) {
                // 직접 게시글 객체가 반환된 경우
                newPost = response
            } else if (response.post && response.post.id) {
                // 래핑된 응답의 경우
                newPost = response.post
            } else if (response.data && response.data.id) {
                // data 래핑된 경우
                newPost = response.data
            } else {
                console.error('Unexpected response structure:', response)
                throw new Error('게시글 생성 응답 형식이 올바르지 않습니다.')
            }

            console.log('Processed new post:', newPost)

            if (!newPost.id || isNaN(newPost.id)) {
                throw new Error('생성된 게시글의 ID가 유효하지 않습니다.')
            }

            // 목록 맨 앞에 추가
            posts.value.unshift(newPost)
            console.log('Post added to store, new post ID:', newPost.id)

            return newPost
        } catch (err) {
            console.error('Error creating post:', err)
            error.value = err.message || '게시글 작성에 실패했습니다.'
            throw err
        } finally {
            loading.value = false
        }
    }

    const updatePost = async (id, postData) => {
        if (!id || !postData.title || !postData.content) {
            throw new Error('필수 정보가 누락되었습니다.')
        }

        loading.value = true
        error.value = null

        try {
            console.log('Updating post:', id, postData)
            const updatedPost = await api.posts.update(id, postData)
            console.log('Updated post:', updatedPost)

            // 목록에서 해당 게시글 업데이트
            const index = posts.value.findIndex(p => p.id === id)
            if (index !== -1) {
                posts.value[index] = updatedPost
            }

            // 현재 게시글이 업데이트된 게시글이라면 갱신
            if (currentPost.value?.post?.id === id) {
                currentPost.value = {
                    ...currentPost.value,
                    post: updatedPost
                }
            }

            return updatedPost
        } catch (err) {
            console.error('Error updating post:', err)
            error.value = err.message || '게시글 수정에 실패했습니다.'
            throw err
        } finally {
            loading.value = false
        }
    }

    const deletePost = async (id) => {
        if (!id) {
            throw new Error('게시글 ID가 필요합니다.')
        }

        loading.value = true
        error.value = null

        try {
            console.log('Deleting post:', id)
            await api.posts.delete(id)
            console.log('Post deleted successfully')

            // 목록에서 제거
            posts.value = posts.value.filter(p => p.id !== id)

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

    // 개선된 검색 함수
    const searchPosts = async (searchParams, page = 0, size = 10) => {
        loading.value = true
        error.value = null

        try {
            console.log('Searching posts:', searchParams, { page, size })

            // 페이지네이션 파라미터 추가
            const finalParams = {
                ...searchParams,
                page,
                size
            }

            console.log('Final search params:', finalParams)

            const response = await api.posts.search(finalParams)
            console.log('Search response:', response)

            posts.value = response.content || []
            pagination.value = {
                page: response.number || 0,
                size: response.size || size,
                totalPages: response.totalPages || 0,
                totalElements: response.totalElements || 0
            }

            // 검색 결과 로깅
            console.log(`검색 완료: ${posts.value.length}개 결과, 총 ${pagination.value.totalElements}개`)

        } catch (err) {
            console.error('Error searching posts:', err)
            error.value = err.message || '검색에 실패했습니다.'

            // 검색 실패 시 빈 결과로 설정
            posts.value = []
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

    // 작성자별 검색 (특별한 처리가 필요한 경우)
    const searchPostsByAuthor = async (author, page = 0, size = 10) => {
        console.log('Searching posts by author:', author)
        return await searchPosts({ author }, page, size)
    }

    // 제목별 검색
    const searchPostsByTitle = async (title, page = 0, size = 10) => {
        console.log('Searching posts by title:', title)
        return await searchPosts({ title }, page, size)
    }

    // 내용별 검색
    const searchPostsByContent = async (content, page = 0, size = 10) => {
        console.log('Searching posts by content:', content)
        return await searchPosts({ content }, page, size)
    }

    // 상태 초기화 함수
    const clearCurrentPost = () => {
        currentPost.value = null
        error.value = null
    }

    const clearError = () => {
        error.value = null
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
        searchPosts,
        searchPostsByAuthor,
        searchPostsByTitle,
        searchPostsByContent,
        clearCurrentPost,
        clearError
    }
})