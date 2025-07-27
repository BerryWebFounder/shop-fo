<template>
  <div>
    <!-- 로딩 상태 -->
    <div v-if="pending || loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">로딩 중...</p>
    </div>

    <!-- 에러 상태 (개선된 디버깅 정보) -->
    <div v-else-if="error" class="card text-center py-8">
      <div class="text-red-600 mb-4">
        <svg class="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <h3 class="text-lg font-semibold mb-2">오류가 발생했습니다</h3>
        <p class="mb-4">{{ error }}</p>

        <!-- 디버깅 정보 -->
        <div class="text-sm text-gray-500 mb-4 bg-gray-100 p-4 rounded">
          <p><strong>디버깅 정보:</strong></p>
          <p>게시글 ID: {{ postId }}</p>
          <p>현재 URL: {{ $route.fullPath }}</p>
          <p>API 기본 URL: {{ config.public.apiBaseUrl }}</p>
          <p>로딩 상태: {{ loading }}</p>
          <p>데이터 상태: {{ currentPost ? '있음' : '없음' }}</p>
          <p>마지막 시도: {{ lastAttemptTime }}</p>
        </div>
      </div>

      <div class="space-y-2">
        <button @click="retryFetch" class="btn-primary">다시 시도</button>
        <br>
        <button @click="tryAlternativeLoad" class="btn-secondary">대체 방법으로 로드</button>
        <br>
        <NuxtLink to="/" class="btn-secondary">목록으로 돌아가기</NuxtLink>
      </div>
    </div>

    <!-- 데이터 없음 -->
    <div v-else-if="!currentPost?.post" class="card text-center py-8">
      <div class="text-gray-500 mb-4">
        <svg class="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
        </svg>
        <h3 class="text-lg font-semibold mb-2">게시글을 찾을 수 없습니다</h3>
        <p class="mb-4">요청하신 게시글이 존재하지 않거나 삭제되었을 수 있습니다.</p>

        <!-- 추가 진단 정보 -->
        <div class="text-sm text-gray-400 mb-4">
          <p>게시글 ID: {{ postId }}</p>
          <p>{{ new Date().toLocaleString() }}</p>
        </div>
      </div>

      <div class="space-y-2">
        <button @click="checkPostInList" class="btn-secondary">목록에서 게시글 확인</button>
        <br>
        <NuxtLink to="/" class="btn-primary">목록으로 돌아가기</NuxtLink>
      </div>
    </div>

    <!-- 게시글 내용 -->
    <div v-else>
      <!-- 게시글 정보 -->
      <article class="card mb-8">
        <header class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">
            {{ currentPost.post.title }}
          </h1>
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-gray-500 border-b pb-4 space-y-2 sm:space-y-0">
            <div class="flex flex-wrap items-center gap-4">
              <span class="flex items-center">
                <Icon name="user" size="sm" class="mr-1" />
                {{ currentPost.post.author }}
              </span>
              <span class="flex items-center">
                <Icon name="calendar" size="sm" class="mr-1" />
                {{ formatDate(currentPost.post.createdAt) }}
              </span>
              <span v-if="currentPost.post.updatedAt !== currentPost.post.createdAt" class="flex items-center">
                <Icon name="edit" size="sm" class="mr-1" />
                수정됨: {{ formatDate(currentPost.post.updatedAt) }}
              </span>
            </div>
            <div class="flex space-x-2">
              <NuxtLink
                  :to="`/posts/${currentPost.post.id}/edit`"
                  class="text-blue-600 hover:text-blue-800 flex items-center px-2 py-1 rounded hover:bg-blue-50"
              >
                <Icon name="edit" size="sm" class="mr-1" />
                수정
              </NuxtLink>
              <button
                  @click="handleDelete"
                  class="text-red-600 hover:text-red-800 flex items-center px-2 py-1 rounded hover:bg-red-50"
                  :disabled="deleting"
              >
                <Icon name="delete" size="sm" class="mr-1" />
                {{ deleting ? '삭제 중...' : '삭제' }}
              </button>
            </div>
          </div>
        </header>

        <!-- 게시글 내용 -->
        <div class="prose max-w-none mb-8">
          <div class="whitespace-pre-wrap text-gray-700 leading-relaxed text-base">
            {{ currentPost.post.content }}
          </div>
        </div>

        <!-- 통계 정보 -->
        <div class="flex flex-wrap items-center gap-6 text-sm text-gray-500 border-t pt-4">
          <span class="flex items-center">
            <Icon name="message" size="sm" class="mr-1" />
            댓글 {{ currentPost.commentCount || 0 }}개
          </span>
          <span class="flex items-center">
            <Icon name="attachment" size="sm" class="mr-1" />
            첨부파일 {{ currentPost.fileCount || 0 }}개
          </span>
          <span class="flex items-center">
            <Icon name="eye" size="sm" class="mr-1" />
            조회 {{ currentPost.post.viewCount || 0 }}회
          </span>
        </div>
      </article>

      <!-- 첨부파일 섹션 (조건부 렌더링 개선) -->
      <div v-if="shouldShowFiles" class="card mb-8">
        <Suspense>
          <template #default>
            <ClientOnly fallback-tag="div" fallback="파일 목록을 불러오는 중...">
              <FileListReadonly
                  :post-id="postId"
                  :can-delete="false"
                  @file-deleted="handleFileDeleted"
                  @file-previewed="handleFilePreview"
              />
            </ClientOnly>
          </template>
          <template #fallback>
            <div class="text-center py-4">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p class="mt-2 text-sm text-gray-600">파일 목록 로딩 중...</p>
            </div>
          </template>
        </Suspense>
      </div>

      <!-- 파일 미리보기 모달 -->
      <div v-if="previewingFile">
        <FilePreview
            :file="previewingFile"
            @close="closeFilePreview"
        />
      </div>

      <!-- 댓글 섹션 -->
      <div class="card mb-8">
        <Suspense>
          <CommentList :post-id="postId" />
          <template #fallback>
            <div class="text-center py-4">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p class="mt-2 text-sm text-gray-600">댓글 로딩 중...</p>
            </div>
          </template>
        </Suspense>
      </div>

      <!-- 네비게이션 버튼 -->
      <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
        <NuxtLink to="/" class="btn-secondary flex items-center w-full sm:w-auto justify-center">
          <Icon name="arrow-left" size="sm" class="mr-2" />
          목록으로
        </NuxtLink>

        <NuxtLink
            :to="`/posts/${currentPost.post.id}/edit`"
            class="btn-primary flex items-center w-full sm:w-auto justify-center"
        >
          <Icon name="edit" size="sm" class="mr-2" />
          수정하기
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

// Store 초기화
let modalStore, postStore
try {
  modalStore = useModalStore()
  postStore = usePostStore()
} catch (error) {
  console.error('Store initialization failed:', error)
  throw createError({
    statusCode: 500,
    statusMessage: 'Store 초기화에 실패했습니다.'
  })
}

// 상태
const deleting = ref(false)
const previewingFile = ref(null)
const lastAttemptTime = ref('')

// 게시글 ID 추출 및 검증
const postId = computed(() => {
  const id = parseInt(route.params.id)
  console.log('Post ID from route:', route.params.id, 'parsed:', id)

  if (isNaN(id) || id <= 0) {
    console.error('Invalid post ID:', route.params.id)
    throw createError({
      statusCode: 400,
      statusMessage: '잘못된 게시글 ID입니다.'
    })
  }
  return id
})

// 파일 표시 여부 개선
const shouldShowFiles = computed(() => {
  // 1. 게시글 데이터에서 파일 개수 확인
  const fileCountFromPost = currentPost.value?.fileCount > 0

  // 2. 파일 개수가 있으면 표시
  return fileCountFromPost
})

// 데이터 로딩 (개선된 에러 처리)
console.log('Fetching post with ID:', postId.value)

const { data: currentPost, pending, error, refresh } = await useLazyAsyncData(
    `post-${postId.value}`,
    async () => {
      try {
        lastAttemptTime.value = new Date().toLocaleString()
        console.log('=== Starting to fetch post ===')
        console.log('Post ID:', postId.value)
        console.log('API Base URL:', config.public.apiBaseUrl)

        if (!postStore) {
          throw new Error('Post store is not initialized')
        }

        // 직접 API 호출로 테스트
        console.log('Testing direct API call...')
        const directResponse = await $fetch(`${config.public.apiBaseUrl}/posts/${postId.value}`)
        console.log('Direct API response:', directResponse)

        // Store를 통한 호출
        console.log('Calling postStore.fetchPostById...')
        await postStore.fetchPostById(postId.value)
        const result = postStore.currentPost

        console.log('Post fetched successfully:', result)

        if (!result || !result.post) {
          console.error('Post data is null or invalid:', result)
          throw new Error('게시글 데이터를 가져올 수 없습니다.')
        }

        return result
      } catch (err) {
        console.error('=== Error in useLazyAsyncData ===')
        console.error('Error type:', err.constructor.name)
        console.error('Error message:', err.message)
        console.error('Error details:', err)

        if (err.status === 404 || err.statusCode === 404) {
          throw new Error('게시글을 찾을 수 없습니다.')
        } else if (err.status === 500 || err.statusCode === 500) {
          throw new Error('서버 오류가 발생했습니다.')
        } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
          throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.')
        }

        throw err
      }
    },
    {
      server: false, // 클라이언트에서만 실행
      default: () => null
    }
)

// Store의 상태도 함께 사용
const { loading } = storeToRefs(postStore)

// 파일 store 사용 (조건부 초기화)
let fileStore = null
let attachedFiles = ref([])

try {
  fileStore = useFileStore()
  const storeRefs = storeToRefs(fileStore)
  attachedFiles = storeRefs.files
} catch (error) {
  console.warn('FileStore initialization failed:', error)
}

// 파일 관련 이벤트 핸들러
const handleFileDeleted = (fileId) => {
  console.log('File deleted:', fileId)
  try {
    if (currentPost.value) {
      currentPost.value.fileCount = Math.max(0, (currentPost.value.fileCount || 0) - 1)
    }
  } catch (error) {
    console.warn('Error handling file deletion:', error)
  }
}

const handleFilePreview = (file) => {
  try {
    console.log('Preview file:', file.originalName)
    previewingFile.value = file
  } catch (error) {
    console.warn('Error handling file preview:', error)
  }
}

const closeFilePreview = () => {
  previewingFile.value = null
}

// 데이터 재시도
const retryFetch = async () => {
  console.log('Retrying fetch...')
  await refresh()
}

// 대체 로드 방법
const tryAlternativeLoad = async () => {
  try {
    console.log('Trying alternative load method...')

    // 목록에서 해당 게시글을 찾아서 로드
    await postStore.fetchPosts(0, 100) // 첫 100개 게시글 가져오기
    const posts = postStore.posts
    const foundPost = posts.find(p => p.id === postId.value)

    if (foundPost) {
      console.log('Found post in list:', foundPost)

      // 기본 구조로 currentPost 설정
      currentPost.value = {
        post: foundPost,
        commentCount: 0,
        fileCount: 0,
        comments: [],
        files: []
      }

      modalStore.showSuccess('게시글을 불러왔습니다. (기본 정보만)')
    } else {
      throw new Error('목록에서도 게시글을 찾을 수 없습니다.')
    }
  } catch (err) {
    console.error('Alternative load failed:', err)
    modalStore.showError('대체 방법으로도 게시글을 불러올 수 없습니다.')
  }
}

// 목록에서 게시글 확인
const checkPostInList = async () => {
  try {
    console.log('Checking post in list...')
    await router.push('/')
  } catch (err) {
    console.error('Navigation failed:', err)
  }
}

// 게시글 삭제
const handleDelete = async () => {
  if (deleting.value) return

  try {
    const confirmed = await modalStore.showConfirm(
        '정말 삭제하시겠습니까?\n삭제된 게시글과 첨부파일은 복구할 수 없습니다.'
    )

    if (!confirmed) return

    deleting.value = true
    console.log('Deleting post:', postId.value)

    await postStore.deletePost(postId.value)
    await modalStore.showSuccess('게시글이 삭제되었습니다.')
    await router.push('/')

  } catch (error) {
    console.error('Delete error:', error)
    await modalStore.showError('게시글 삭제에 실패했습니다.')
  } finally {
    deleting.value = false
  }
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Date formatting error:', error)
    return dateString
  }
}

// 라우트 변경 감지
watch(() => route.params.id, (newId, oldId) => {
  console.log('Route param changed:', { from: oldId, to: newId })
  if (newId !== oldId) {
    refresh()
  }
})

// 페이지 진입 시 파일 목록 미리 로드 (안전하게 처리)
onMounted(async () => {
  console.log('=== Component mounted ===')
  console.log('Current route:', route.fullPath)
  console.log('Post ID:', postId.value)
  console.log('Current post data:', currentPost.value)

  // 파일 목록 미리 로드 (fileStore가 있고 파일이 있을 때만)
  if (postId.value && fileStore && shouldShowFiles.value) {
    try {
      console.log('Preloading files for post:', postId.value)
      await fileStore.fetchFilesByPostId(postId.value)
    } catch (error) {
      console.warn('Failed to preload files:', error)
    }
  }
})

// SEO 메타데이터
useHead({
  title: computed(() => {
    if (currentPost.value?.post?.title) {
      return currentPost.value.post.title
    }
    return '게시글'
  }),
  meta: [
    {
      name: 'description',
      content: computed(() => {
        if (currentPost.value?.post?.content) {
          return currentPost.value.post.content.substring(0, 150)
        }
        return ''
      })
    }
  ]
})
</script>

<style scoped>
.prose {
  line-height: 1.7;
}

.card + .card {
  margin-top: 2rem;
}

@media (max-width: 640px) {
  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>