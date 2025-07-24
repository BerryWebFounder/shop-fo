<template>
  <div v-if="loading && !currentPost" class="text-center py-8">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
    <p class="mt-4 text-gray-600">로딩 중...</p>
  </div>

  <div v-else-if="error" class="card text-center py-8">
    <p class="text-red-600 mb-4">{{ error }}</p>
    <NuxtLink to="/" class="btn-primary">목록으로 돌아가기</NuxtLink>
  </div>

  <div v-else-if="currentPost">
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

// 게시글 데이터 로드
await postStore.fetchPostById(postId)

const form = ref({
  title: currentPost.value?.post?.title || '',
  content: currentPost.value?.post?.content || ''
})

const handleSubmit = async () => {
  try {
    await postStore.updatePost(postId, form.value)
    await router.push(`/posts/${postId}`)
  } catch (error) {
    alert('게시글 수정에 실패했습니다.')
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// SEO 메타데이터
useHead({
  title: () => `게시글 수정 - ${currentPost.value?.post?.title || ''}`,
  meta: [
    { name: 'description', content: '게시글을 수정합니다.' }
  ]
})
</script>