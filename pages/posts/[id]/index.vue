<template>
  <div>
    <!-- 로딩 상태 -->
    <div v-if="pending || loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">로딩 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="card text-center py-8">
      <div class="text-red-600 mb-4">
        <svg class="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <h3 class="text-lg font-semibold mb-2">오류가 발생했습니다</h3>
        <p class="mb-4">{{ error }}</p>
        <div class="text-sm text-gray-500 mb-4">
          <p>요청한 게시글 ID: {{ postId }}</p>
          <p>현재 URL: {{ $route.fullPath }}</p>
        </div>
      </div>
      <div class="space-y-2">
        <button @click="retryFetch" class="btn-primary">다시 시도</button>
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
      </div>
      <NuxtLink to="/" class="btn-primary">목록으로 돌아가기</NuxtLink>
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
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
                {{ currentPost.post.author }}
              </span>
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                </svg>
                {{ formatDate(currentPost.post.createdAt) }}
              </span>
              <span v-if="currentPost.post.updatedAt !== currentPost.post.createdAt" class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                수정됨: {{ formatDate(currentPost.post.updatedAt) }}
              </span>
            </div>
            <div class="flex space-x-2">
              <NuxtLink
                  :to="`/posts/${currentPost.post.id}/edit`"
                  class="text-blue-600 hover:text-blue-800 flex items-center px-2 py-1 rounded hover:bg-blue-50"
              >
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                수정
              </NuxtLink>
              <button
                  @click="handleDelete"
                  class="text-red-600 hover:text-red-800 flex items-center px-2 py-1 rounded hover:bg-red-50"
                  :disabled="deleting"
              >
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd" />
                  <path fill-rule="evenodd" d="M4 5a1 1 0 011-1h10a1 1 0 110 2H6v9a2 2 0 002 2h4a2 2 0 002-2V6h1a1 1 0 110-2H5a1 1 0 01-1 1zM8 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd" />
                </svg>
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
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
            </svg>
            댓글 {{ currentPost.commentCount || 0 }}개
          </span>
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd" />
            </svg>
            첨부파일 {{ currentPost.fileCount || 0 }}개
          </span>
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
            </svg>
            조회 {{ currentPost.post.viewCount || 0 }}회
          </span>
        </div>
      </article>

      <!-- 첨부파일 섹션 (파일이 있을 때만 표시) -->
      <div v-if="hasFiles" class="card mb-8">
        <Suspense>
          <!-- 읽기 전용 파일 목록 사용 -->
          <FileListReadonly
              :post-id="postId"
              :can-delete="true"
              @file-deleted="handleFileDeleted"
              @file-previewed="handleFilePreview"
          />
          <template #fallback>
            <div class="text-center py-4">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p class="mt-2 text-sm text-gray-600">파일 목록 로딩 중...</p>
            </div>
          </template>
        </Suspense>
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
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          목록으로
        </NuxtLink>

        <NuxtLink
            :to="`/posts/${currentPost.post.id}/edit`"
            class="btn-primary flex items-center w-full sm:w-auto justify-center"
        >
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          수정하기
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

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
        console.log('Starting to fetch post:', postId.value)

        if (!postStore) {
          throw new Error('Post store is not initialized')
        }

        await postStore.fetchPostById(postId.value)
        const result = postStore.currentPost

        console.log('Post fetched successfully:', result)
        return result
      } catch (err) {
        console.error('Error in useLazyAsyncData:', err)
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

// 파일 store 사용
const fileStore = useFileStore()
const { files: attachedFiles } = storeToRefs(fileStore)

// 첨부파일 표시 여부 (실제 파일이 있을 때만)
const hasFiles = computed(() => {
  // 1. 게시글 데이터에서 파일 개수 확인
  const fileCountFromPost = currentPost.value?.fileCount > 0

  // 2. 파일 store에서 실제 파일 확인
  const hasActualFiles = attachedFiles.value && attachedFiles.value.length > 0

  // 3. 둘 중 하나라도 true면 파일이 있다고 판단
  return fileCountFromPost || hasActualFiles
})

// 파일 관련 이벤트 핸들러
const handleFileDeleted = (fileId) => {
  console.log('File deleted:', fileId)
  // 파일이 삭제되면 hasFiles 재계산을 위해 파일 목록 새로고침
  // (FileListReadonly 컴포넌트에서 자동으로 처리됨)
}

const handleFilePreview = (file) => {
  console.log('Preview file:', file.originalName)
  // 파일 미리보기 모달 표시 로직
  // 필요시 FilePreview 컴포넌트 사용
}

// 데이터 재시도
const retryFetch = async () => {
  console.log('Retrying fetch...')
  await refresh()
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

// 라우트 변경 감지 (디버깅)
watch(() => route.params.id, (newId, oldId) => {
  console.log('Route param changed:', { from: oldId, to: newId })
  if (newId !== oldId) {
    refresh()
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

// 디버깅 정보 출력
onMounted(() => {
  console.log('Component mounted')
  console.log('Current route:', route.fullPath)
  console.log('Post ID:', postId.value)
  console.log('Current post data:', currentPost.value)
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