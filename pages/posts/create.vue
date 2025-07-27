<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">새 게시글 작성</h1>
      <p class="text-sm text-gray-500 mt-1">
        게시글을 작성하고 첨부파일을 업로드할 수 있습니다.
      </p>
    </div>

    <!-- 기본 정보 입력 폼 (파일 관리 제외) -->
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
                :disabled="isSubmitting"
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
                :disabled="isSubmitting"
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
                :disabled="isSubmitting"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- 작성 완료 버튼 -->
      <div class="flex justify-end space-x-4">
        <NuxtLink to="/" class="btn-secondary" :disabled="isSubmitting">
          취소
        </NuxtLink>
        <button
            type="submit"
            class="btn-primary"
            :disabled="isSubmitting || !isFormValid"
        >
          {{ submitButtonText }}
        </button>
      </div>
    </form>

    <!-- 첨부파일 관리 (폼 외부) -->
    <div class="card mt-6">
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <Icon name="attachment" size="sm" class="mr-2" />
            첨부파일 선택
          </h3>
          <div class="text-sm text-gray-500">
            <span v-if="selectedFiles.length > 0">
              {{ selectedFiles.length }}개 파일 선택됨
            </span>
            <span v-else>
              파일 선택 안함
            </span>
          </div>
        </div>

        <!-- 파일 선택 영역 -->
        <div
            class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors"
            :class="{
              'border-blue-400 bg-blue-50': isDragOver,
              'border-green-400 bg-green-50': isDragOver && selectedFiles.length > 0
            }"
            @drop="handleDrop"
            @dragover.prevent="handleDragOver"
            @dragleave="handleDragLeave"
            @dragenter.prevent="handleDragEnter"
        >
          <div class="text-center">
            <input
                ref="fileInput"
                type="file"
                multiple
                accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.rar"
                @change="handleFileSelect"
                class="hidden"
                :disabled="isSubmitting"
            />

            <Icon name="upload" size="xl" color="gray" class="mx-auto mb-4" />

            <!-- 이제 폼 외부이므로 문제가 발생하지 않음 -->
            <button
                type="button"
                @click="triggerFileSelect"
                class="btn-primary mb-2"
                :disabled="isSubmitting"
            >
              파일 선택
            </button>

            <p class="text-sm text-gray-500">
              또는 파일을 여기로 드래그하세요
            </p>
            <p class="text-xs text-gray-400 mt-1">
              최대 파일 크기: {{ formatFileSize(maxFileSize) }} •
              최대 {{ maxFiles }}개 파일
            </p>
          </div>
        </div>

        <!-- 선택된 파일 목록 -->
        <div v-if="selectedFiles.length > 0" class="space-y-2">
          <h4 class="font-medium text-gray-900 flex items-center">
            <Icon name="file" size="sm" class="mr-2" />
            선택된 파일 ({{ selectedFiles.length }}개):
          </h4>

          <div class="space-y-2 max-h-40 overflow-y-auto">
            <div
                v-for="(file, index) in selectedFiles"
                :key="`selected-${index}`"
                class="flex justify-between items-center bg-blue-50 p-3 rounded border"
            >
              <div class="flex items-center space-x-3 flex-1 min-w-0">
                <Icon :name="getFileIcon(file.name)" size="sm" color="blue" />
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ file.name }}</p>
                  <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <span v-if="file.size > maxFileSize" class="text-xs text-red-600">
                  크기 초과
                </span>
                <button
                    type="button"
                    @click="removeSelectedFile(index)"
                    class="text-red-600 hover:text-red-800 p-1"
                    title="제거"
                    :disabled="isSubmitting"
                >
                  <Icon name="close" size="sm" />
                </button>
              </div>
            </div>
          </div>

          <!-- 파일 정보 요약 -->
          <div class="flex justify-between items-center pt-2 text-sm">
            <div class="text-gray-500">
              <span v-if="validFiles.length !== selectedFiles.length" class="text-red-600">
                {{ selectedFiles.length - validFiles.length }}개 파일이 크기 제한을 초과합니다
              </span>
              <span v-else class="text-green-600">
                모든 파일이 업로드 가능합니다
              </span>
            </div>

            <button
                type="button"
                @click="clearSelectedFiles"
                class="btn-secondary text-sm"
                :disabled="isSubmitting"
            >
              전체 제거
            </button>
          </div>
        </div>

        <!-- 파일 업로드 안내 -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex">
            <Icon name="info" size="sm" color="blue" class="mr-2 mt-0.5" />
            <div class="text-sm text-blue-800">
              <p class="font-medium mb-1">파일 업로드 안내</p>
              <ul class="text-xs space-y-1">
                <li>• 게시글 작성 완료 후 선택한 파일들이 자동으로 업로드됩니다</li>
                <li>• 최대 파일 크기: {{ formatFileSize(maxFileSize) }}</li>
                <li>• 최대 파일 개수: {{ maxFiles }}개</li>
                <li>• 이미지, 문서, 압축파일 등 대부분의 파일 형식을 지원합니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 진행 상태 표시 -->
    <div v-if="isSubmitting" class="card bg-blue-50 border-blue-200 mt-6">
      <div class="flex items-center space-x-3">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <div>
          <p class="font-medium text-blue-900">{{ submissionStatus.title }}</p>
          <p class="text-sm text-blue-700">{{ submissionStatus.message }}</p>
        </div>
      </div>

      <!-- 파일 업로드 진행률 (필요시) -->
      <div v-if="submissionStatus.showProgress" class="mt-3">
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: uploadProgress + '%' }"
          ></div>
        </div>
        <p class="text-xs text-blue-600 mt-1 text-center">{{ uploadProgress }}%</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const router = useRouter()
const config = useRuntimeConfig()

// Store 초기화 (안전하게)
let modalStore, postStore, fileStore
try {
  modalStore = useModalStore()
  postStore = usePostStore()
  fileStore = useFileStore()
} catch (error) {
  console.error('Store initialization failed:', error)
  throw createError({
    statusCode: 500,
    statusMessage: 'Store 초기화에 실패했습니다. 페이지를 새로고침해주세요.'
  })
}

// Store 상태
const {loading} = storeToRefs(postStore)

// 설정값
const maxFileSize = computed(() => config.public.maxFileSize || 50 * 1024 * 1024)
const maxFiles = computed(() => config.public.maxFiles || 20)

// 파일 입력 참조
const fileInput = ref(null)

// 폼 데이터
const form = ref({
  title: '',
  content: '',
  author: ''
})

// 상태 관리
const isSubmitting = ref(false)
const isSubmitted = ref(false)
const selectedFiles = ref([])
const isDragOver = ref(false)
const uploadProgress = ref(0)
const submissionStatus = ref({
  title: '',
  message: '',
  showProgress: false
})

// 계산된 속성
const isFormValid = computed(() => {
  return form.value.title.trim() &&
      form.value.content.trim() &&
      form.value.author.trim()
})

const validFiles = computed(() => {
  return selectedFiles.value.filter(file => file.size <= maxFileSize.value)
})

const submitButtonText = computed(() => {
  if (isSubmitting.value) {
    return submissionStatus.value.title || '처리 중...'
  }
  return '게시글 작성'
})

// 파일 선택 트리거 함수 (단순화됨)
const triggerFileSelect = () => {
  console.log('File select button clicked (outside form)')
  console.log('File input ref:', fileInput.value)

  if (fileInput.value) {
    fileInput.value.click()
    console.log('File input clicked programmatically')
  } else {
    console.error('File input ref not found')
    modalStore.showError('파일 선택 기능에 오류가 있습니다. 페이지를 새로고침해주세요.')
  }
}

// 파일 관련 함수
const getFileIcon = (fileName) => {
  if (!fileName) return 'file'

  const extension = fileName.split('.').pop()?.toLowerCase()
  const iconMap = {
    // 이미지
    jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', bmp: 'image', svg: 'image', webp: 'image',
    // 문서
    pdf: 'file', doc: 'file', docx: 'file', txt: 'file', rtf: 'file',
    // 스프레드시트
    xls: 'file', xlsx: 'file', csv: 'file',
    // 프레젠테이션
    ppt: 'file', pptx: 'file',
    // 압축
    zip: 'archive', rar: 'archive', '7z': 'archive',
    // 코드
    js: 'file', html: 'file', css: 'file', json: 'file',
    // 미디어
    mp3: 'music', mp4: 'video', avi: 'video'
  }

  return iconMap[extension] || 'file'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 파일 선택 처리
const handleFileSelect = (event) => {
  console.log('handleFileSelect triggered (outside form)')
  console.log('Event target:', event.target)
  console.log('Files:', event.target.files)

  const files = Array.from(event.target.files)
  console.log('Files selected:', files.map(f => ({name: f.name, size: f.size})))

  if (files.length === 0) {
    console.log('No files selected')
    return
  }

  addFiles(files)

  // 입력 초기화 (중요: 같은 파일을 다시 선택할 수 있도록)
  event.target.value = ''
  console.log('File input value cleared')
}

// 드래그 앤 드롭 핸들러
const dragCounter = ref(0)

const handleDragEnter = (e) => {
  e.preventDefault()
  e.stopPropagation()
  dragCounter.value++
  isDragOver.value = true
  console.log('Drag enter, counter:', dragCounter.value)
}

const handleDragLeave = (e) => {
  e.preventDefault()
  e.stopPropagation()
  dragCounter.value--
  if (dragCounter.value === 0) {
    isDragOver.value = false
  }
  console.log('Drag leave, counter:', dragCounter.value)
}

const handleDragOver = (e) => {
  e.preventDefault()
  e.stopPropagation()
}

const handleDrop = (event) => {
  event.preventDefault()
  event.stopPropagation()

  console.log('handleDrop triggered (outside form)')

  // 드래그 상태 초기화
  isDragOver.value = false
  dragCounter.value = 0

  const files = Array.from(event.dataTransfer.files)
  console.log('Files dropped:', files.map(f => ({name: f.name, size: f.size})))

  if (files.length === 0) {
    console.log('No files dropped')
    return
  }

  addFiles(files)
}

const addFiles = (files) => {
  console.log('Adding files:', files.length)

  // 중복 파일 체크 (이름과 크기가 모두 같은 경우)
  const newFiles = files.filter(file => {
    const isDuplicate = selectedFiles.value.some(selected =>
        selected.name === file.name && selected.size === file.size
    )
    if (isDuplicate) {
      console.log('Duplicate file skipped:', file.name)
    }
    return !isDuplicate
  })

  console.log('New files after duplicate check:', newFiles.length)

  // 최대 파일 수 체크
  const remainingSlots = maxFiles.value - selectedFiles.value.length
  const filesToAdd = newFiles.slice(0, remainingSlots)

  console.log('Files to add:', filesToAdd.length, 'Remaining slots:', remainingSlots)

  if (filesToAdd.length < newFiles.length) {
    modalStore.showWarning(`최대 ${maxFiles.value}개 파일만 선택할 수 있습니다.`)
  }

  if (filesToAdd.length > 0) {
    selectedFiles.value = [...selectedFiles.value, ...filesToAdd]
    console.log('Total selected files:', selectedFiles.value.length)
  }
}

const removeSelectedFile = (index) => {
  console.log('Removing file at index:', index, selectedFiles.value[index]?.name)
  selectedFiles.value.splice(index, 1)
  console.log('Remaining files:', selectedFiles.value.length)
}

const clearSelectedFiles = () => {
  console.log('Clearing all selected files:', selectedFiles.value.length)
  selectedFiles.value = []
}

// 게시글 작성 처리 (오류 처리 강화)
const handleSubmit = async () => {
  console.log('=== handleSubmit called ===')
  console.log('Current state:', {
    isSubmitting: isSubmitting.value,
    isFormValid: isFormValid.value,
    selectedFiles: selectedFiles.value.length
  })

  if (isSubmitting.value || !isFormValid.value) {
    console.log('Submit blocked - already submitting or form invalid')
    return
  }

  let createdPostId = null

  try {
    isSubmitting.value = true
    console.log('Starting post creation process...')

    // 1. 게시글 생성
    submissionStatus.value = {
      title: '게시글 생성 중...',
      message: '게시글을 저장하고 있습니다.',
      showProgress: false
    }

    console.log('Creating post:', form.value)
    const newPost = await postStore.createPost(form.value)
    console.log('Post created response:', newPost)

    // 게시글 ID 추출 및 검증
    createdPostId = newPost?.id || newPost?.posts?.id
    console.log('Extracted post ID:', createdPostId)

    if (!createdPostId || isNaN(createdPostId)) {
      console.error('Invalid post ID received:', {newPost, createdPostId})
      throw new Error('게시글이 생성되었지만 ID를 가져올 수 없습니다.')
    }

    // 2. 파일이 있으면 업로드
    if (validFiles.value.length > 0) {
      submissionStatus.value = {
        title: '파일 업로드 중...',
        message: `${validFiles.value.length}개 파일을 업로드하고 있습니다.`,
        showProgress: true
      }

      try {
        console.log('Starting file upload for post:', createdPostId)
        console.log('Files to upload:', validFiles.value.map(f => ({name: f.name, size: f.size})))

        // 진행률 시뮬레이션
        const progressInterval = setInterval(() => {
          if (uploadProgress.value < 90) {
            uploadProgress.value += 10
          }
        }, 200)

        // 파일 업로드 실행
        await fileStore.uploadFiles(createdPostId, validFiles.value)

        clearInterval(progressInterval)
        uploadProgress.value = 100

        console.log('File upload completed successfully')

        // 제출 완료 상태로 변경
        isSubmitted.value = true
        isSubmitting.value = false

        await modalStore.showSuccess(
            `게시글이 작성되었습니다. (첨부파일 ${validFiles.value.length}개 포함)`
        )
      } catch (fileError) {
        console.error('File upload error:', fileError)

        // 제출 완료 상태로 변경 (게시글은 생성됨)
        isSubmitted.value = true
        isSubmitting.value = false

        await modalStore.showWarning(
            '게시글은 작성되었지만 일부 파일 업로드에 실패했습니다.\n게시글 페이지에서 다시 파일을 업로드해주세요.'
        )
      }
    } else {
      // 제출 완료 상태로 변경
      isSubmitted.value = true
      isSubmitting.value = false

      await modalStore.showSuccess('게시글이 작성되었습니다.')
    }

    // 3. 상세 페이지로 이동 (안전하게)
    console.log('Navigating to post detail page:', createdPostId)

    // 잠시 대기 후 이동 (백엔드에서 데이터 처리 완료를 위해)
    await new Promise(resolve => setTimeout(resolve, 500))

    // 게시글이 실제로 존재하는지 확인 후 이동
    try {
      console.log('Verifying post exists before navigation...')
      await postStore.fetchPostById(createdPostId)
      console.log('Post verification successful, navigating...')
      await router.push(`/posts/${createdPostId}`)
    } catch (verifyError) {
      console.error('Post verification failed:', verifyError)

      // 게시글 확인 실패 시 목록으로 이동
      await modalStore.showWarning(
          '게시글이 작성되었지만 페이지 이동 중 오류가 발생했습니다.\n목록에서 게시글을 확인해주세요.'
      )
      await router.push('/')
    }

  } catch (error) {
    console.error('Post creation error:', error)

    let errorMessage = '게시글 작성에 실패했습니다.'
    if (error.message) {
      errorMessage += '\n' + error.message
    }

    // 게시글이 생성되었지만 오류가 발생한 경우
    if (createdPostId && !isNaN(createdPostId)) {
      errorMessage += `\n\n게시글 ID ${createdPostId}는 생성되었을 수 있습니다. 목록에서 확인해주세요.`

      await modalStore.showWarning(errorMessage)
      await router.push('/')
    } else {
      await modalStore.showError(errorMessage)
    }

    // 에러 발생 시 상태 초기화
    isSubmitting.value = false
    uploadProgress.value = 0
    submissionStatus.value = {title: '', message: '', showProgress: false}
  }
}

// 페이지 이탈 시 경고
const hasUnsavedChanges = computed(() => {
  // 이미 제출 완료되었거나 제출 중이면 변경사항 없음으로 처리
  if (isSubmitted.value || isSubmitting.value) {
    return false
  }

  const hasFormData = form.value.title.trim() ||
      form.value.content.trim() ||
      form.value.author.trim()

  const hasFiles = selectedFiles.value.length > 0

  console.log('hasUnsavedChanges check:', {
    hasFormData,
    hasFiles,
    totalFiles: selectedFiles.value.length,
    isSubmitted: isSubmitted.value,
    isSubmitting: isSubmitting.value
  })

  return hasFormData || hasFiles
})

onBeforeRouteLeave(async (to, from, next) => {
  console.log('onBeforeRouteLeave triggered:', {
    isSubmitting: isSubmitting.value,
    isSubmitted: isSubmitted.value,
    hasUnsavedChanges: hasUnsavedChanges.value
  })

  // 이미 제출 완료되었으면 바로 이동
  if (isSubmitted.value) {
    console.log('Post already submitted, allowing navigation')
    next()
    return
  }

  // 제출이 진행 중일 때
  if (isSubmitting.value) {
    console.log('Still submitting, blocking navigation')
    await modalStore.showWarning('게시글 작성이 진행 중입니다. 잠시만 기다려주세요.')
    next(false)
    return
  }

  // 변경사항이 있으면 확인 후 이동
  if (hasUnsavedChanges.value) {
    console.log('Has unsaved changes, asking for confirmation')
    const confirmed = await modalStore.showConfirm(
        '작성 중인 내용이 있습니다. 정말 나가시겠습니까?'
    )
    next(confirmed)
  } else {
    console.log('No unsaved changes, allowing navigation')
    next()
  }
})

// 브라우저 새로고침/닫기 시 경고
onMounted(() => {
  const handleBeforeUnload = (e) => {
    // 제출 완료되었거나 제출 중이면 경고하지 않음
    if (isSubmitted.value || isSubmitting.value) {
      return
    }

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
    {name: 'description', content: '새로운 게시글을 작성합니다.'}
  ]
})
</script>