<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">새 게시글 작성</h1>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="card">
        <div class="space-y-4">
          <div>
            <label for="author" class="block text-sm font-medium text-gray-700 mb-2">
              작성자 *
            </label>
            <input
                id="author"
                v-model="form.author"
                type="text"
                required
                class="form-input"
                placeholder="작성자명을 입력하세요"
            />
          </div>

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
        </div>
      </div>

      <div class="flex justify-end space-x-4">
        <NuxtLink to="/" class="btn-secondary">
          취소
        </NuxtLink>
        <button
            type="submit"
            class="btn-primary"
            :disabled="loading"
        >
          {{ loading ? '작성 중...' : '게시글 작성' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
const router = useRouter()
const postStore = usePostStore()
const { loading } = storeToRefs(postStore)

const form = ref({
  title: '',
  content: '',
  author: ''
})

const handleSubmit = async () => {
  try {
    const newPost = await postStore.createPost(form.value)
    await router.push(`/posts/${newPost.id}`)
  } catch (error) {
    alert('게시글 작성에 실패했습니다.')
  }
}

// SEO 메타데이터
useHead({
  title: '새 게시글 작성',
  meta: [
    { name: 'description', content: '새로운 게시글을 작성합니다.' }
  ]
})
</script>