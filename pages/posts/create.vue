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

      <!-- 첨부파일 관리 -->
      <div class="card">
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center">
              <Icon name="attachment" size="sm" class="mr-2" />
              첨부파일 관리
            </h3>
            <div class="text-sm text-gray-500">
                <span v-if="currentPost.fileCount > 0">
                  현재 {{ currentPost.fileCount }}개 파일 첨부됨
                </span>
              <span v-else>
                  첨부파일 없음
                </span>
            </div>
          </div>

          <!-- 파일 업로드 컴포넌트 (에러 처리 강화) -->
          <Suspense>
            <template #default>
              <ClientOnly fallback-tag="div" fallback="파일 관리 시스템을 불러오는 중...">
                <FileUpload
                    v-if="fileStore"
                    :post-id="postId"
                    :max-files="20"
                    :max-file-size="50 * 1024 * 1024"
                    @files-uploaded="handleFilesUploaded"
                    @file-deleted="handleFileDeleted"
                />
                <div v-else class="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <div class="text-center text-gray-500">
                    <Icon name="warning" size="lg" class="mx-auto mb-2" />
                    <p>파일 업로드 기능을 사용할 수 없습니다.</p>
                    <p class="text-sm">페이지를 새로고침 후 다시 시도해주세요.</p>
                  </div>
                </div>
              </ClientOnly>
            </template>
            <template #fallback>
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <div class="text-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p class="mt-2 text-sm text-gray-600">파일 관리 시스템 로딩 중...</p>
                </div>
              </div>
            </template>
          </Suspense>

          <!-- 파일 관리 도움말 -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex">
              <Icon name="info" size="sm" color="blue" class="mr-2 mt-0.5" />
              <div class="text-sm text-blue-800">
                <p class="font-medium mb-1">파일 업로드 안내</p>
                <ul class="text-xs space-y-1">
                  <li>• 최대 파일 크기: 50MB</li>
                  <li>• 최대 파일 개수: 20개</li>
                  <li>• 드래그 앤 드롭으로 여러 파일을 한번에 업로드할 수 있습니다</li>
                  <li>• 이미지, 문서, 압축파일 등 대부분의 파일 형식을 지원합니다</li>
                </ul>
              </div>
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