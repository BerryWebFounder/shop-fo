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

      <!-- 임시 첨부파일 섹션 (기존 파일 업로드 로직 단순화) -->
      <div class="card">
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900">첨부파일</h3>
          <p class="text-sm text-gray-500 mt-1">
            게시글 저장 후 파일을 업로드할 수 있습니다.
          </p>
        </div>

        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div class="text-center">
            <input
                ref="tempFileInput"
                type="file"
                multiple
                @change="handleTempFileSelect"
                class="hidden"
            />

            <div class="mb-4">
              <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>

            <button
                type="button"
                @click="$refs.tempFileInput.click()"
                class="btn-secondary"
            >
              파일 미리 선택
            </button>

            <p class="text-sm text-gray-500 mt-2">
              게시글 저장 후 자동으로 업로드됩니다
            </p>
          </div>
        </div>

        <!-- 임시 선택된 파일 목록 -->
        <div v-if="tempFiles.length > 0" class="mt-4 space-y-2">
          <h4 class="font-medium text-gray-900">선택된 파일 ({{ tempFiles.length }}개):</h4>
          <div class="space-y-2 max-h-40 overflow-y-auto">
            <div
                v-for="(file, index) in tempFiles"
                :key="`temp-${index}`"
                class="flex justify-between items-center bg-gray-50 p-3 rounded border"
            >
              <div class="flex items-center space-x-3 flex-1 min-w-0">
                <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                </svg>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ file.name }}</p>
                  <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
                </div>
              </div>
              <button
                  type="button"
                  @click="removeTempFile(index)"
                  class="text-red-600 hover:text-red-800"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 작성 완료 버튼 -->
      <div class="flex justify-end space-x-4">
        <NuxtLink to="/" class="btn-secondary">
          취소
        </NuxtLink>
        <button
            type="submit"
            class="btn-primary"
            :disabled="loading || isSubmitting || !isFormValid"
        >
          {{ submitButtonText }}
        </button>
      </div>

      <!-- 진행 상태 표시 -->
      <div v-if="isSubmitting" class="card bg-blue-50 border-blue-200">
        <div class="flex items-center space-x-3">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <div>
            <p class="font-medium text-blue-900">{{ submissionStatus.title }}</p>
            <p class="text-sm text-blue-700">{{ submissionStatus.message }}</p>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
const router = useRouter()
const modalStore = useModalStore()
const postStore = usePostStore()
const { loading } = storeToRefs(postStore)

// 폼 데이터
const form = ref({
  title: '',
  content: '',
  author: ''
})

// 상태 관리
const isSubmitting = ref(false)
const tempFiles = ref([])
const submissionStatus = ref({
  title: '',
  message: ''
})

// 계산된 속성
const isFormValid = computed(() => {
  return form.value.title.trim() &&
      form.value.content.trim() &&
      form.value.author.trim()
})

const submitButtonText = computed(() => {
  if (isSubmitting.value) {
    return submissionStatus.value.title || '처리 중...'
  }
  return '게시글 작성'
})

// 임시 파일 선택 처리
const handleTempFileSelect = (event) => {
  const files = Array.from(event.target.files)
  tempFiles.value = [...tempFiles.value, ...files]

  // 입력 초기화
  event.target.value = ''
}

// 임시 파일 제거
const removeTempFile = (index) => {
  tempFiles.value.splice(index, 1)
}

// 파일 크기 포맷팅
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 게시글 작성 처리
const handleSubmit = async () => {
  if (isSubmitting.value) return

  // 유효성 검사
  if (!isFormValid.value) {
    await modalStore.showError('모든 필드를 입력해주세요.')
    return
  }

  try {
    isSubmitting.value = true

    // 1. 게시글 생성
    submissionStatus.value = {
      title: '게시글 생성 중...',
      message: '게시글을 저장하고 있습니다.'
    }

    console.log('Creating post:', form.value)
    const newPost = await postStore.createPost(form.value)
    console.log('Post created:', newPost)

    // 2. 파일이 있으면 업로드 시도
    if (tempFiles.value.length > 0) {
      submissionStatus.value = {
        title: '파일 업로드 중...',
        message: `${tempFiles.value.length}개 파일을 업로드하고 있습니다.`
      }

      try {
        // FileStore 사용하여 파일 업로드
        const fileStore = useFileStore()
        await fileStore.uploadFiles(newPost.id, tempFiles.value)

        await modalStore.showSuccess(
            `게시글이 작성되었습니다. (첨부파일 ${tempFiles.value.length}개 포함)`
        )
      } catch (fileError) {
        console.error('File upload error:', fileError)
        await modalStore.showWarning(
            '게시글은 작성되었지만 일부 파일 업로드에 실패했습니다.\n게시글 페이지에서 다시 파일을 업로드해주세요.'
        )
      }
    } else {
      await modalStore.showSuccess('게시글이 작성되었습니다.')
    }

    // 3. 상세 페이지로 이동
    await router.push(`/posts/${newPost.id}`)

  } catch (error) {
    console.error('Post creation error:', error)
    await modalStore.showError('게시글 작성에 실패했습니다.\n' + (error.message || ''))
  } finally {
    isSubmitting.value = false
    submissionStatus.value = { title: '', message: '' }
  }
}

// 페이지 이탈 시 경고 (개선)
const hasUnsavedChanges = computed(() => {
  return (form.value.title.trim() ||
          form.value.content.trim() ||
          form.value.author.trim() ||
          tempFiles.value.length > 0) &&
      !isSubmitting.value
})

// Nuxt3의 beforeRouteLeave 사용
onBeforeRouteLeave(async (to, from, next) => {
  if (isSubmitting.value) {
    await modalStore.showWarning('게시글 작성이 진행 중입니다. 잠시만 기다려주세요.')
    next(false)
    return
  }

  if (hasUnsavedChanges.value) {
    const confirmed = await modalStore.showConfirm(
        '작성 중인 내용이 있습니다. 정말 나가시겠습니까?'
    )
    next(confirmed)
  } else {
    next()
  }
})

// 브라우저 새로고침/닫기 시 경고
onMounted(() => {
  const handleBeforeUnload = (e) => {
    if (hasUnsavedChanges.value) {
      e.preventDefault()
      e.returnValue = ''
    }
  }

  window.addEventListener('beforeunload', handleBeforeUnload)

  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })
})

// SEO 메타데이터
useHead({
  title: '새 게시글 작성',
  meta: [
    { name: 'description', content: '새로운 게시글을 작성합니다.' }
  ]
})
</script>