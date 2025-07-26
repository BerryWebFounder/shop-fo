<template>
  <div>
    <div v-if="loading || !currentPost" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">로딩 중...</p>
    </div>

    <div v-else-if="error" class="card text-center py-8">
      <p class="text-red-600 mb-4">{{ error }}</p>
      <p class="text-sm text-gray-500 mb-4">API 요청 중 오류가 발생했습니다.</p>
      <div class="space-y-2">
        <button @click="retryFetch" class="btn-primary">다시 시도</button>
        <br>
        <NuxtLink to="/" class="btn-secondary">목록으로 돌아가기</NuxtLink>
      </div>
    </div>

    <div v-else-if="!currentPost || !currentPost.post" class="card text-center py-8">
      <p class="text-gray-600 mb-4">게시글을 찾을 수 없습니다.</p>
      <NuxtLink to="/" class="btn-primary">목록으로 돌아가기</NuxtLink>
    </div>

    <div v-else>
      <!-- 게시글 내용 -->
      <article class="card mb-8">
        <header class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">
            {{ currentPost.post.title }}
          </h1>
          <div class="flex justify-between items-center text-sm text-gray-500 border-b pb-4">
            <div class="flex items-center space-x-4">
              <span class="flex items-center">
                <span class="mr-1">👤</span>
                {{ currentPost.post.author }}
              </span>
              <span>{{ formatDate(currentPost.post.createdAt) }}</span>
              <span v-if="currentPost.post.updatedAt !== currentPost.post.createdAt">
                (수정됨: {{ formatDate(currentPost.post.updatedAt) }})
              </span>
            </div>
            <div class="flex space-x-2">
              <NuxtLink
                  :to="`/posts/${currentPost.post.id}/edit`"
                  class="text-blue-600 hover:text-blue-800"
              >
                수정
              </NuxtLink>
              <button
                  @click="handleDelete"
                  class="text-red-600 hover:text-red-800"
              >
                삭제
              </button>
            </div>
          </div>
        </header>

        <div class="prose max-w-none mb-8">
          <p class="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {{ currentPost.post.content }}
          </p>
        </div>

        <!-- 통계 정보 -->
        <div class="flex items-center space-x-6 text-sm text-gray-500 border-t pt-4">
          <span>댓글 {{ currentPost.commentCount || 0 }}개</span>
          <span>첨부파일 {{ currentPost.fileCount || 0 }}개</span>
        </div>
      </article>

      <!-- 댓글 -->
      <div class="card mb-8">
        <CommentList :post-id="postId" />
      </div>

      <!-- 네비게이션 -->
      <div class="flex justify-between">
        <NuxtLink to="/" class="btn-secondary">
          목록으로
        </NuxtLink>
        <div class="space-x-2">
          <NuxtLink
              :to="`/posts/${currentPost.post.id}/edit`"
              class="btn-primary"
          >
            수정하기
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const modalStore = useModalStore()
const postStore = usePostStore()
const { currentPost, loading, error } = storeToRefs(postStore)

// 게시글 ID 가져오기 및 유효성 검사
const postId = computed(() => {
  const id = parseInt(route.params.id)
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: '잘못된 게시글 ID입니다.'
    })
  }
  return id
})

console.log('Post ID:', postId.value)

// 데이터 재시도 함수
const retryFetch = async () => {
  try {
    await postStore.fetchPostById(postId.value)
  } catch (err) {
    console.error('Retry failed:', err)
  }
}

// 게시글 데이터 로드
try {
  console.log('Fetching post with ID:', postId.value)
  await postStore.fetchPostById(postId.value)
  console.log('Post fetched:', currentPost.value)
} catch (err) {
  console.error('Failed to fetch post:', err)
  // 에러가 발생해도 페이지는 렌더링하되, 에러 상태를 표시
}

// 게시글 삭제
const handleDelete = async () => {
  if (await modalStore.showConfirm('정말 삭제하시겠습니까?')) {
    try {
      await postStore.deletePost(postId.value)
      await router.push('/')
    } catch (error) {
      await modalStore.showError('게시글 삭제에 실패했습니다.')
      console.error('Delete error:', error)
    }
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    return new Date(dateString).toLocaleDateString('ko-KR', {
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