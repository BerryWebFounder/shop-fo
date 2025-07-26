<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">새 게시글 작성</h1>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- 기본 정보 입력 -->
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

      <!-- 파일 첨부 영역 -->
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">파일 첨부</h3>
        <FileAttachment
            ref="fileAttachment"
            @files-selected="handleFilesSelected"
            @files-removed="handleFilesRemoved"
        />
      </div>

      <!-- 작성 완료 버튼 -->
      <div class="flex justify-end space-x-4">
        <NuxtLink to="/" class="btn-secondary">
          취소
        </NuxtLink>
        <button
            type="submit"
            class="btn-primary"
            :disabled="loading || isSubmitting"
        >
          {{ isSubmitting ? '작성 중...' : '게시글 작성' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
const router = useRouter()
const modalStore = useModalStore()
const postStore = usePostStore()
const { loading } = storeToRefs(postStore)

const form = ref({
  title: '',
  content: '',
  author: ''
})

const isSubmitting = ref(false)
const selectedFiles = ref([])

// 파일 선택 처리
const handleFilesSelected = (files) => {
  selectedFiles.value = [...selectedFiles.value, ...files]
}

// 파일 제거 처리
const handleFilesRemoved = (files) => {
  selectedFiles.value = selectedFiles.value.filter(
      selected => !files.some(removed =>
          removed.name === selected.name && removed.size === selected.size
      )
  )
}

// 게시글 작성 처리
const handleSubmit = async () => {
  if (isSubmitting.value) return

  try {
    isSubmitting.value = true

    // 1. 게시글 생성
    const newPost = await postStore.createPost(form.value)

    // 2. 파일이 있으면 업로드
    if (selectedFiles.value.length > 0) {
      const fileStore = useFileStore()

      try {
        await fileStore.uploadFiles(newPost.id, selectedFiles.value)
        await modalStore.showSuccess(
            `게시글이 작성되었습니다. (첨부파일 ${selectedFiles.value.length}개 포함)`
        )
      } catch (fileError) {
        console.error('File upload error:', fileError)
        await modalStore.showWarning(
            '게시글은 작성되었지만 일부 파일 업로드에 실패했습니다.\n게시글에서 다시 파일을 업로드해주세요.'
        )
      }
    } else {
      await modalStore.showSuccess('게시글이 작성되었습니다.')
    }

    // 3. 상세 페이지로 이동
    await router.push(`/posts/${newPost.id}`)

  } catch (error) {
    console.error('Post creation error:', error)
    await modalStore.showError('게시글 작성에 실패했습니다.')
  } finally {
    isSubmitting.value = false
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