<template>
  <div>
    <div v-if="loading && !currentPost" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">로딩 중...</p>
    </div>

    <div v-else-if="error" class="card text-center py-8">
      <p class="text-red-600 mb-4">{{ error }}</p>
      <div class="bg-gray-100 p-4 rounded mb-4 text-left">
        <p><strong>디버깅 정보:</strong></p>
        <p>게시글 ID: {{ postId }}</p>
        <p>현재 상태: {{ currentPost ? '데이터 있음' : '데이터 없음' }}</p>
        <p>로딩 상태: {{ loading }}</p>
      </div>
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
              <p v-if="currentPost.post.updatedAt !== currentPost.post.createdAt">
                최종 수정일: {{ formatDate(currentPost.post.updatedAt) }}
              </p>
            </div>
          </div>
        </div>

        <!-- 첨부파일 -->
        <div class="card mb-8">
          <FileUpload :post-id="postId" />
        </div>

        <div class="flex justify-end space-x-4">
          <NuxtLink :to="`/posts/${postId}`" class="btn-secondary">
            취소
          </NuxtLink>
          <button
              type="submit"
              class="btn-primary"
              :disabled="loading || !form.title.trim() || !form.content.trim()"
          >
            {{ loading ? '수정 중...' : '수정 완료' }}
          </button>
        </div>
      </form>
    </div>

    <div v-else class="card text-center py-8">
      <p class="text-gray-600 mb-4">게시글을 찾을 수 없습니다.</p>
      <NuxtLink to="/" class="btn-primary">목록으로 돌아가기</NuxtLink>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const modalStore = useModalStore()
const postStore = usePostStore()
const { currentPost, loading, error } = storeToRefs(postStore)

// 게시글 ID 가져오기
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

console.log('Edit page - Post ID:', postId.value)

// 폼 데이터 초기화
const form = ref({
  title: '',
  content: ''
})

// 게시글 데이터 로드
try {
  console.log('Loading post for edit:', postId.value)
  await postStore.fetchPostById(postId.value)
  console.log('Post loaded for edit:', currentPost.value)
} catch (err) {
  console.error('Failed to fetch post for edit:', err)
}

// currentPost가 로드된 후 폼 데이터 설정
watch(currentPost, (newPost) => {
  console.log('currentPost changed:', newPost)
  if (newPost?.post) {
    form.value = {
      title: newPost.post.title || '',
      content: newPost.post.content || ''
    }
    console.log('Form initialized:', form.value)
  }
}, { immediate: true })

// 폼 제출 처리
const handleSubmit = async () => {
  if (!form.value.title.trim() || !form.value.content.trim()) {
    await modalStore.showError('제목과 내용을 모두 입력해주세요.')
    return
  }

  try {
    console.log('Submitting form:', form.value)
    await postStore.updatePost(postId.value, form.value)
    console.log('Post updated successfully')
    await router.push(`/posts/${postId.value}`)
  } catch (error) {
    console.error('Update error:', error)
    await modalStore.showError('게시글 수정에 실패했습니다.')
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
      return `게시글 수정 - ${currentPost.value.post.title}`
    }
    return '게시글 수정'
  }),
  meta: [
    {name: 'description', content: '게시글을 수정합니다.'}
  ]
})
</script>