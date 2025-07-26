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

    const fetchPostById = async (id) => {
        if (!id || isNaN(id)) {
            error.value = '잘못된 게시글 ID입니다.'
            return
        }

        loading.value = true
        error.value = null
        currentPost.value = null

        try {
            console.log('Fetching post by ID:', id)
            const response = await api.posts.getById(id)
            console.log('API response:', response)

            if (!response) {
                throw new Error('응답이 비어있습니다.')
            }

            // 백엔드 응답 구조에 맞게 처리
            const postData = {
                post: response.posts,
                commentCount: response.commentCount || 0,
                fileCount: response.fileCount || 0,
                comments: response.comments || [],
                files: response.files || []
            }

            console.log('Processed post data:', postData)
            currentPost.value = postData

        } catch (err) {
            console.error('Error fetching post:', err)

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
            console.log('Creating post:', postData)
            const newPost = await api.posts.create(postData)
            console.log('Created post:', newPost)

            // 목록 맨 앞에 추가
            posts.value.unshift(newPost)
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