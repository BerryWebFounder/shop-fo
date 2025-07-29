<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 로딩 상태 -->
    <div v-if="pending || loading" class="bg-white border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-6 py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">게시글을 불러오는 중...</p>
        </div>
      </div>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="bg-white border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-6 py-12">
        <div class="text-center">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="warning" size="lg" color="red" />
          </div>
          <h3 class="text-xl font-semibold text-red-900 mb-2">오류가 발생했습니다</h3>
          <p class="text-red-600 mb-6">{{ error }}</p>

          <!-- 디버깅 정보 (개발 모드에서만) -->
          <details v-if="showDebugInfo" class="text-left bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <summary class="cursor-pointer text-sm font-medium text-red-800 mb-2">디버깅 정보</summary>
            <div class="text-xs text-red-700 space-y-1">
              <p><strong>게시글 ID:</strong> {{ postId }}</p>
              <p><strong>현재 URL:</strong> {{ $route.fullPath }}</p>
              <p><strong>API 기본 URL:</strong> {{ config.public.apiBaseUrl }}</p>
              <p><strong>마지막 시도:</strong> {{ lastAttemptTime }}</p>
            </div>
          </details>

          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button @click="retryFetch" class="btn-primary">다시 시도</button>
            <button @click="tryAlternativeLoad" class="btn-secondary">대체 방법으로 로드</button>
            <NuxtLink to="/" class="btn-secondary">목록으로 돌아가기</NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- 게시글을 찾을 수 없는 경우 -->
    <div v-else-if="!currentPost?.post" class="bg-white border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-6 py-12">
        <div class="text-center">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="file" size="lg" color="gray" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">게시글을 찾을 수 없습니다</h3>
          <p class="text-gray-600 mb-6">요청하신 게시글이 존재하지 않거나 삭제되었을 수 있습니다.</p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button @click="checkPostInList" class="btn-secondary">목록에서 게시글 확인</button>
            <NuxtLink to="/" class="btn-primary">목록으로 돌아가기</NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- 메인 컨텐츠 -->
    <div v-else>
      <!-- 게시글 헤더 -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-4xl mx-auto px-6 py-8">
          <div class="space-y-6">
            <!-- 공지사항 배지 (공지사항인 경우에만) -->
            <div v-if="currentPost.post.isNotice" class="flex flex-wrap gap-2">
              <!-- 중요 공지사항 배지 -->
              <span v-if="currentPost.post.isPinned" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                <Icon name="warning" size="xs" class="mr-1" />
                중요 공지사항
              </span>

              <!-- 일반 공지사항 배지 -->
              <span v-else class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <Icon name="info" size="xs" class="mr-1" />
                공지사항
              </span>

              <!-- 활성 상태 -->
              <span v-if="!currentPost.post.isActive" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                비활성
              </span>

              <!-- 만료 예정 경고 -->
              <span v-if="isExpiringSoon" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                <Icon name="warning" size="xs" class="mr-1" />
                곧 만료
              </span>

              <!-- 만료된 공지사항 -->
              <span v-if="isExpired" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                <Icon name="close" size="xs" class="mr-1" />
                만료됨
              </span>
            </div>

            <!-- 제목 -->
            <div>
              <h1 class="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                {{ currentPost.post.title }}
              </h1>
            </div>

            <!-- 메타 정보 -->
            <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div class="flex items-center">
                  <Icon name="user" size="sm" class="mr-2 text-gray-400" />
                  <span class="font-medium">{{ currentPost.post.author }}</span>
                </div>
                <div class="flex items-center">
                  <Icon name="calendar" size="sm" class="mr-2 text-gray-400" />
                  <span>{{ formatDate(currentPost.post.createdAt) }}</span>
                </div>
                <div v-if="currentPost.post.updatedAt !== currentPost.post.createdAt" class="flex items-center">
                  <Icon name="edit" size="sm" class="mr-2 text-gray-400" />
                  <span>수정: {{ formatRelativeTime(currentPost.post.updatedAt) }}</span>
                </div>
                <div v-if="currentPost.post.isNotice && currentPost.post.expiryDate" class="flex items-center">
                  <Icon name="calendar" size="sm" class="mr-2 text-gray-400" />
                  <span>만료: {{ formatExpiryDate(currentPost.post.expiryDate) }}</span>
                </div>
              </div>

              <!-- 액션 버튼 -->
              <div class="flex flex-wrap gap-2">
                <NuxtLink
                    :to="`/posts/${currentPost.post.id}/edit`"
                    class="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Icon name="edit" size="sm" class="mr-1" />
                  수정
                </NuxtLink>
                <button
                    @click="handleDelete"
                    class="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                    :disabled="deleting"
                >
                  <Icon name="delete" size="sm" class="mr-1" />
                  {{ deleting ? '삭제 중...' : '삭제' }}
                </button>
                <button
                    @click="sharePost"
                    class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Icon name="user" size="sm" class="mr-1" />
                  공유
                </button>
              </div>
            </div>

            <!-- 통계 정보 -->
            <div class="flex flex-wrap items-center gap-6 text-sm text-gray-500 pt-4 border-t border-gray-100">
              <div class="flex items-center">
                <Icon name="eye" size="sm" class="mr-1 text-gray-400" />
                <span>조회 {{ currentPost.post.viewCount || 0 }}회</span>
              </div>
              <div class="flex items-center">
                <Icon name="message" size="sm" class="mr-1 text-gray-400" />
                <span>댓글 {{ currentPost.commentCount || 0 }}개</span>
              </div>
              <div class="flex items-center">
                <Icon name="attachment" size="sm" class="mr-1 text-gray-400" />
                <span>첨부파일 {{ currentPost.fileCount || 0 }}개</span>
              </div>
              <div v-if="currentPost.post.isNotice" class="flex items-center">
                <Icon name="info" size="sm" class="mr-1 text-gray-400" />
                <span>{{ getNoticeTypeText() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <!-- 게시글 내용 -->
        <article class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-8">
            <div class="prose prose-lg max-w-none">
              <div class="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {{ currentPost.post.content }}
              </div>
            </div>

            <!-- 공지사항 추가 정보 -->
            <div v-if="currentPost.post.isNotice && hasNoticeInfo" class="mt-8 pt-6 border-t border-gray-100">
              <h3 class="text-sm font-medium text-gray-700 mb-4">공지사항 정보</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div v-if="currentPost.post.expiryDate" class="flex items-center text-gray-600">
                  <Icon name="calendar" size="sm" class="mr-2 text-gray-400" />
                  <span>만료일: {{ formatDate(currentPost.post.expiryDate) }}</span>
                </div>
                <div class="flex items-center text-gray-600">
                  <Icon name="info" size="sm" class="mr-2 text-gray-400" />
                  <span>상태: {{ currentPost.post.isActive ? '활성' : '비활성' }}</span>
                </div>
                <div v-if="currentPost.post.isPinned" class="flex items-center text-gray-600">
                  <Icon name="warning" size="sm" class="mr-2 text-gray-400" />
                  <span>중요 공지사항으로 설정됨</span>
                </div>
              </div>
            </div>
          </div>
        </article>

        <!-- 첨부파일 섹션 -->
        <div v-if="shouldShowFiles" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-6">
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
                <div class="text-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p class="text-sm text-gray-600">파일 목록 로딩 중...</p>
                </div>
              </template>
            </Suspense>
          </div>
        </div>

        <!-- 댓글 섹션 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-6">
            <Suspense>
              <CommentList :post-id="postId" />
              <template #fallback>
                <div class="text-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p class="text-sm text-gray-600">댓글 로딩 중...</p>
                </div>
              </template>
            </Suspense>
          </div>
        </div>

        <!-- 네비게이션 버튼 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
            <NuxtLink
                to="/"
                class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Icon name="arrow-left" size="sm" class="mr-2" />
              목록으로 돌아가기
            </NuxtLink>

            <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <NuxtLink
                  :to="`/posts/${currentPost.post.id}/edit`"
                  class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Icon name="edit" size="sm" class="mr-2" />
                수정하기
              </NuxtLink>

              <button
                  @click="sharePost"
                  class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Icon name="user" size="sm" class="mr-2" />
                공유하기
              </button>
            </div>
          </div>
        </div>

        <!-- 관련 게시글 (추후 구현 가능) -->
        <div v-if="false" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">관련 게시글</h3>
            <!-- 관련 게시글 목록 -->
          </div>
        </div>
      </div>
    </div>

    <!-- 파일 미리보기 모달 -->
    <div v-if="previewingFile">
      <FilePreview
          :file="previewingFile"
          @close="closeFilePreview"
      />
    </div>

    <!-- 공유 모달 -->
    <div v-if="showShareModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div class="text-center">
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="user" size="lg" color="blue" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">게시글 공유</h3>
          <p class="text-gray-600 mb-4">이 게시글의 링크가 클립보드에 복사되었습니다.</p>

          <div class="bg-gray-50 rounded-lg p-3 mb-4">
            <p class="text-sm text-gray-700 break-all">{{ shareUrl }}</p>
          </div>

          <button
              @click="closeShareModal"
              class="w-full btn-primary"
          >
            확인
          </button>
        </div>
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
const showShareModal = ref(false)
const shareUrl = ref('')

// 개발 모드 체크
const showDebugInfo = computed(() => {
  return process.dev || config.public.debug === 'true'
})

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

// 데이터 로딩
console.log('Fetching post with ID:', postId.value)

const { data: currentPost, pending, error, refresh } = await useLazyAsyncData(
    `post-${postId.value}`,
    async () => {
      try {
        lastAttemptTime.value = new Date().toLocaleString()
        console.log('=== Starting to fetch post ===')
        console.log('Post ID:', postId.value)

        if (!postStore) {
          throw new Error('Post store is not initialized')
        }

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
      server: false,
      default: () => null
    }
)

const { loading } = storeToRefs(postStore)

// 계산된 속성들
const shouldShowFiles = computed(() => {
  return currentPost.value?.fileCount > 0
})

const isExpiringSoon = computed(() => {
  if (!currentPost.value?.post?.isNotice || !currentPost.value.post.expiryDate) return false

  const expiryDate = new Date(currentPost.value.post.expiryDate)
  const now = new Date()
  const threeDaysFromNow = new Date()
  threeDaysFromNow.setDate(now.getDate() + 3)

  return expiryDate <= threeDaysFromNow && expiryDate > now
})

const isExpired = computed(() => {
  if (!currentPost.value?.post?.isNotice || !currentPost.value.post.expiryDate) return false

  const expiryDate = new Date(currentPost.value.post.expiryDate)
  const now = new Date()

  return expiryDate <= now
})

const hasNoticeInfo = computed(() => {
  if (!currentPost.value?.post?.isNotice) return false

  return currentPost.value.post.expiryDate ||
      currentPost.value.post.isPinned ||
      !currentPost.value.post.isActive
})

// 유틸리티 함수들
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

const formatRelativeTime = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return '오늘'
    } else if (diffDays === 2) {
      return '어제'
    } else if (diffDays <= 7) {
      return `${diffDays - 1}일 전`
    } else {
      return formatDate(dateString)
    }
  } catch (error) {
    return formatDate(dateString)
  }
}

const formatExpiryDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    const now = new Date()

    if (date <= now) {
      return '만료됨'
    }

    const diffTime = date - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return '내일 만료'
    } else if (diffDays <= 7) {
      return `${diffDays}일 후 만료`
    } else {
      return formatDate(dateString)
    }
  } catch (error) {
    return formatDate(dateString)
  }
}

const getNoticeTypeText = () => {
  if (!currentPost.value?.post?.isNotice) return ''

  if (currentPost.value.post.isPinned) {
    return '중요 공지사항'
  } else {
    return '일반 공지사항'
  }
}

// 이벤트 핸들러들
const handleFileDeleted = (fileId) => {
  console.log('File deleted:', fileId)
  if (currentPost.value) {
    currentPost.value.fileCount = Math.max(0, (currentPost.value.fileCount || 0) - 1)
  }
}

const handleFilePreview = (file) => {
  console.log('Preview file:', file.originalName)
  previewingFile.value = file
}

const closeFilePreview = () => {
  previewingFile.value = null
}

const retryFetch = async () => {
  console.log('Retrying fetch...')
  await refresh()
}

const tryAlternativeLoad = async () => {
  try {
    console.log('Trying alternative load method...')
    await postStore.fetchPosts(0, 100)
    const posts = postStore.posts
    const foundPost = posts.find(p => p.id === postId.value)

    if (foundPost) {
      console.log('Found post in list:', foundPost)
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

const checkPostInList = async () => {
  try {
    console.log('Checking post in list...')
    await router.push('/')
  } catch (err) {
    console.error('Navigation failed:', err)
  }
}

const handleDelete = async () => {
  if (deleting.value) return

  try {
    const postType = currentPost.value?.post?.isNotice ?
        (currentPost.value.post.isPinned ? '중요 공지사항' : '공지사항') :
        '게시글'

    const confirmed = await modalStore.showConfirm(
        `정말 삭제하시겠습니까?\n삭제된 ${postType}과 첨부파일은 복구할 수 없습니다.`
    )

    if (!confirmed) return

    deleting.value = true
    console.log('Deleting post:', postId.value)

    await postStore.deletePost(postId.value)
    await modalStore.showSuccess(`${postType}이 삭제되었습니다.`)
    await router.push('/')

  } catch (error) {
    console.error('Delete error:', error)
    await modalStore.showError('게시글 삭제에 실패했습니다.')
  } finally {
    deleting.value = false
  }
}

const sharePost = async () => {
  try {
    const currentUrl = window.location.href
    shareUrl.value = currentUrl

    // 클립보드에 복사
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(currentUrl)
    } else {
      // 폴백: 텍스트 선택 방식
      const textArea = document.createElement('textarea')
      textArea.value = currentUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }

    showShareModal.value = true
  } catch (error) {
    console.error('Share failed:', error)
    modalStore.showError('링크 복사에 실패했습니다.')
  }
}

const closeShareModal = () => {
  showShareModal.value = false
  shareUrl.value = ''
}

// 파일 store 초기화 (조건부)
let fileStore = null
try {
  fileStore = useFileStore()
} catch (error) {
  console.warn('FileStore initialization failed:', error)
}

// 라우트 변경 감지
watch(() => route.params.id, (newId, oldId) => {
  console.log('Route param changed:', { from: oldId, to: newId })
  if (newId !== oldId) {
    refresh()
  }
})

// 파일 목록 미리 로드
onMounted(async () => {
  console.log('=== Component mounted ===')
  console.log('Current route:', route.fullPath)
  console.log('Post ID:', postId.value)

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
      const postType = currentPost.value.post.isNotice ? '공지사항' : '게시글'
      return `${currentPost.value.post.title} - ${postType}`
    }
    return '게시글'
  }),
  meta: [
    {
      name: 'description',
      content: computed(() => {
        if (currentPost.value?.post?.content) {
          return currentPost.value.post.content.substring(0, 160)
        }
        return '게시글을 확인하세요.'
      })
    },
    {
      property: 'og:title',
      content: computed(() => {
        if (currentPost.value?.post?.title) {
          return currentPost.value.post.title
        }
        return '게시글'
      })
    },
    {
      property: 'og:description',
      content: computed(() => {
        if (currentPost.value?.post?.content) {
          return currentPost.value.post.content.substring(0, 160)
        }
        return ''
      })
    },
    {
      property: 'og:type',
      content: 'article'
    }
  ]
})
</script>

<style scoped>
/* 프로즈 스타일 개선 */
.prose {
  line-height: 1.75;
}

.prose p {
  margin-bottom: 1.25rem;
}

/* 카드 hover 효과 */
.bg-white:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* 버튼 호버 효과 개선 */
.btn-primary:hover,
.btn-secondary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

/* 배지 애니메이션 */
.inline-flex {
  transition: all 0.2s ease-in-out;
}

/* 반응형 개선 */
@media (max-width: 640px) {
  .prose {
    font-size: 0.875rem;
  }

  .text-3xl {
    font-size: 1.5rem;
  }

  .md\:text-4xl {
    font-size: 1.75rem;
  }

  .px-6 {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .py-8 {
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
  }
}

/* 로딩 애니메이션 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 스크롤 부드럽게 */
html {
  scroll-behavior: smooth;
}

/* 접근성 개선 */
@media (prefers-reduced-motion: reduce) {
  .animate-spin {
    animation: none;
  }

  .transition-colors,
  .transition-all {
    transition: none;
  }
}
</style>