<template>
  <div v-if="loading && !currentPost" class="text-center py-8">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
    <p class="mt-4 text-gray-600">로딩 중...</p>
  </div>

  <div v-else-if="error" class="card text-center py-8">
    <p class="text-red-600 mb-4">{{ error }}</p>
    <NuxtLink to="/" class="btn-primary">목록으로 돌아가기</NuxtLink>
  </div>

  <div v-else-if="currentPost && currentPost.post">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">게시글 수정</h1>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="card">
        <div class="space-y-4">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
                id="title"
                v-model="form.title"
                type="text"
                required
                class="form-input"
                placeholder="제목을 입력하세요"
            />
          </div>

          <div>
            <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
              내용 *
            </label>
            <textarea
                id="content"
                v-model="form.content"
                required
                rows="15"
                class="form-textarea"
                placeholder="내용을 입력하세요"
            ></textarea>
          </div>

          <div class="text-sm text-gray-500">
            <p>작성자: {{ currentPost.post.author }}</p>
            <p>작성일: {{ formatDate(currentPost.post.createdAt) }}</p>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-4">
        <NuxtLink :to="`/posts/${postId}`" class="btn-secondary">
          취소
        </NuxtLink>
        <button
            type="submit"
            class="btn-primary"
            :disabled="loading"
        >
          {{ loading ? '수정 중...' : '수정 완료' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const postStore = usePostStore()
const { currentPost, loading, error } = storeToRefs(postStore)

const postId = parseInt(route.params.id)

// 게시글 데이터 로드 (try-catch로 에러 처리)
try {
  await postStore.fetchPostById(postId)
} catch (err) {
  console.error('Failed to fetch post:', err)
}

// 폼 데이터 초기화 (안전한 접근)
const form = ref({
  title: '',
  content: ''
})

// currentPost가 로드된 후 폼 데이터 설정
watch(currentPost, (newPost) => {
  if (newPost?.post) {
    form.value = {
      title: newPost.post.title || '',
      content: newPost.post.content || ''
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  try {
    await postStore.updatePost(postId, form.value)
    await router.push(`/posts/${postId}`)
  } catch (error) {
    alert('게시글 수정에 실패했습니다.')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// SEO 메타데이터 (안전한 접근)
useHead({
  title: computed(() => {
    if (currentPost.value?.post?.title) {
      return `게시글 수정 - ${currentPost.value.post.title}`
    }
    return '게시글 수정'
  }),
  meta: [
    {name: 'description', content: '게시글을 수정합니다.'}
  ]
})
</script>