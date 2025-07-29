<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 헤더 -->
    <div class="bg-white border-b border-gray-200 mb-8">
      <div class="max-w-4xl mx-auto px-6 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">새 게시글 작성</h1>
            <p class="text-gray-600 mt-2">게시글이나 공지사항을 작성하세요</p>
          </div>
          <div class="hidden md:block">
            <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <Icon name="edit" size="lg" color="blue" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-6 pb-12">
      <form @submit.prevent="handleSubmit" class="space-y-8">

        <!-- 기본 정보 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">기본 정보</h2>

          <div class="space-y-6">
            <div>
              <label for="author" class="block text-sm font-medium text-gray-700 mb-2">
                작성자 *
              </label>
              <input
                  id="author"
                  v-model="form.author"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                  rows="12"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-y"
                  placeholder="내용을 입력하세요"
                  :disabled="isSubmitting"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- 공지사항 설정 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900">게시글 설정</h2>
            <div class="flex items-center">
              <input
                  id="isNotice"
                  v-model="form.isNotice"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  :disabled="isSubmitting"
              />
              <label for="isNotice" class="ml-2 text-sm font-medium text-gray-700">
                공지사항으로 작성
              </label>
            </div>
          </div>

          <!-- 공지사항 옵션들 -->
          <transition name="slide-down">
            <div v-if="form.isNotice" class="space-y-4 pt-4 border-t border-gray-100">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex items-center">
                  <input
                      id="isPinned"
                      v-model="form.isPinned"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      :disabled="isSubmitting"
                  />
                  <label for="isPinned" class="ml-2 text-sm text-gray-700">
                    중요 공지사항 (상단 고정)
                  </label>
                </div>

                <div class="flex items-center">
                  <input
                      id="isActive"
                      v-model="form.isActive"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      :disabled="isSubmitting"
                  />
                  <label for="isActive" class="ml-2 text-sm text-gray-700">
                    즉시 활성화
                  </label>
                </div>

                <div class="flex items-center">
                  <input
                      id="sendNotification"
                      v-model="form.sendNotification"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      :disabled="isSubmitting"
                  />
                  <label for="sendNotification" class="ml-2 text-sm text-gray-700">
                    알림 발송
                  </label>
                </div>
              </div>

              <div>
                <label for="expiryDate" class="block text-sm font-medium text-gray-700 mb-2">
                  만료일 (선택사항)
                </label>
                <input
                    id="expiryDate"
                    v-model="form.expiryDate"
                    type="datetime-local"
                    class="w-full md:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    :disabled="isSubmitting"
                    :min="minDateTime"
                />
                <p class="text-xs text-gray-500 mt-1">
                  만료일이 지나면 공지사항이 자동으로 비활성화됩니다
                </p>
              </div>

              <!-- 미리보기 -->
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center space-x-2 text-sm">
                  <span class="text-gray-600">미리보기:</span>
                  <span v-if="form.isPinned" class="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                    중요
                  </span>
                  <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    공지사항
                  </span>
                  <span v-if="!form.isActive" class="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                    비활성
                  </span>
                  <span v-if="form.expiryDate" class="text-xs text-gray-500">
                    {{ formatDateTime(form.expiryDate) }}까지
                  </span>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- 첨부파일 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900">첨부파일</h2>
            <span class="text-sm text-gray-500">
              {{ selectedFiles.length }}개 선택됨
            </span>
          </div>

          <!-- 파일 선택 영역 -->
          <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
              :class="{ 'border-blue-400 bg-blue-50': isDragOver }"
              @drop="handleDrop"
              @dragover.prevent="handleDragOver"
              @dragleave="handleDragLeave"
              @dragenter.prevent="handleDragEnter"
          >
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

            <div class="space-y-2">
              <button
                  type="button"
                  @click="triggerFileSelect"
                  class="btn-secondary"
                  :disabled="isSubmitting"
              >
                파일 선택
              </button>
              <p class="text-sm text-gray-500">
                또는 파일을 드래그해서 놓으세요
              </p>
              <p class="text-xs text-gray-400">
                최대 {{ formatFileSize(maxFileSize) }}, {{ maxFiles }}개까지
              </p>
            </div>
          </div>

          <!-- 선택된 파일 목록 -->
          <div v-if="selectedFiles.length > 0" class="mt-6 space-y-3">
            <div
                v-for="(file, index) in selectedFiles"
                :key="`file-${index}`"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center space-x-3 flex-1 min-w-0">
                <Icon :name="getFileIcon(file.name)" size="sm" />
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
                    class="text-gray-400 hover:text-red-500 transition-colors"
                    :disabled="isSubmitting"
                >
                  <Icon name="close" size="sm" />
                </button>
              </div>
            </div>

            <!-- 파일 요약 -->
            <div class="flex justify-between items-center pt-3 border-t border-gray-200 text-sm">
              <span class="text-gray-600">
                총 {{ selectedFiles.length }}개 파일
                <span v-if="validFiles.length !== selectedFiles.length" class="text-red-600">
                  ({{ selectedFiles.length - validFiles.length }}개 크기 초과)
                </span>
              </span>
              <button
                  type="button"
                  @click="clearSelectedFiles"
                  class="text-gray-500 hover:text-gray-700 transition-colors"
                  :disabled="isSubmitting"
              >
                전체 제거
              </button>
            </div>
          </div>
        </div>

        <!-- 제출 버튼 -->
        <div class="flex justify-end space-x-4">
          <NuxtLink to="/" class="btn-secondary" :class="{ 'opacity-50 pointer-events-none': isSubmitting }">
            취소
          </NuxtLink>
          <button
              type="submit"
              class="btn-primary"
              :disabled="isSubmitting || !isFormValid"
          >
            <span v-if="isSubmitting" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ submissionStatus.title || '작성 중...' }}
            </span>
            <span v-else>
              {{ submitButtonText }}
            </span>
          </button>
        </div>
      </form>
    </div>

    <!-- 제출 진행 모달 -->
    <div v-if="isSubmitting" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div class="text-center">
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ submissionStatus.title }}</h3>
          <p class="text-gray-600 mb-4">{{ submissionStatus.message }}</p>

          <!-- 진행률 바 -->
          <div v-if="submissionStatus.showProgress" class="w-full bg-gray-200 rounded-full h-2">
            <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: uploadProgress + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const router = useRouter()
const config = useRuntimeConfig()

// Store 초기화
let modalStore, postStore, fileStore
try {
  modalStore = useModalStore()
  postStore = usePostStore()
  fileStore = useFileStore()
} catch (error) {
  console.error('Store initialization failed:', error)
  throw createError({
    statusCode: 500,
    statusMessage: 'Store 초기화에 실패했습니다.'
  })
}

// 설정값
const maxFileSize = computed(() => config.public.maxFileSize || 50 * 1024 * 1024)
const maxFiles = computed(() => config.public.maxFiles || 20)

// 참조
const fileInput = ref(null)

// 폼 데이터
const form = ref({
  title: '',
  content: '',
  author: '',
  isNotice: false,
  isPinned: false,
  isActive: true,
  expiryDate: '',
  sendNotification: false
})

// 상태
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

// 최소 날짜시간
const minDateTime = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
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
  if (form.value.isNotice) {
    return form.value.isPinned ? '중요 공지사항 작성' : '공지사항 작성'
  }
  return '게시글 작성'
})

// 유틸리티 함수들
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return ''
  return new Date(dateTimeString).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const getFileIcon = (fileName) => {
  if (!fileName) return 'file'
  const extension = fileName.split('.').pop()?.toLowerCase()
  const iconMap = {
    jpg: 'image', jpeg: 'image', png: 'image', gif: 'image',
    pdf: 'file', doc: 'file', docx: 'file', txt: 'file',
    zip: 'archive', rar: 'archive'
  }
  return iconMap[extension] || 'file'
}

// 파일 관련 함수들
const triggerFileSelect = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  if (files.length === 0) return
  addFiles(files)
  event.target.value = ''
}

// 드래그 앤 드롭
const dragCounter = ref(0)

const handleDragEnter = (e) => {
  e.preventDefault()
  dragCounter.value++
  isDragOver.value = true
}

const handleDragLeave = (e) => {
  e.preventDefault()
  dragCounter.value--
  if (dragCounter.value === 0) {
    isDragOver.value = false
  }
}

const handleDragOver = (e) => {
  e.preventDefault()
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  dragCounter.value = 0
  const files = Array.from(event.dataTransfer.files)
  if (files.length === 0) return
  addFiles(files)
}

const addFiles = (files) => {
  const newFiles = files.filter(file => {
    return !selectedFiles.value.some(selected =>
        selected.name === file.name && selected.size === file.size
    )
  })

  const remainingSlots = maxFiles.value - selectedFiles.value.length
  const filesToAdd = newFiles.slice(0, remainingSlots)

  if (filesToAdd.length < newFiles.length) {
    modalStore.showWarning(`최대 ${maxFiles.value}개 파일만 선택할 수 있습니다.`)
  }

  if (filesToAdd.length > 0) {
    selectedFiles.value = [...selectedFiles.value, ...filesToAdd]
  }
}

const removeSelectedFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const clearSelectedFiles = () => {
  selectedFiles.value = []
}

// 폼 제출
const handleSubmit = async () => {
  if (isSubmitting.value || !isFormValid.value) return

  let createdPostId = null

  try {
    isSubmitting.value = true

    const postType = form.value.isNotice ?
        (form.value.isPinned ? '중요 공지사항' : '공지사항') :
        '게시글'

    submissionStatus.value = {
      title: `${postType} 생성 중...`,
      message: `${postType}을 저장하고 있습니다.`,
      showProgress: false
    }

    // 게시글 생성
    const postData = {
      title: form.value.title,
      content: form.value.content,
      author: form.value.author,
      isNotice: form.value.isNotice,
      isPinned: form.value.isNotice ? form.value.isPinned : false,
      isActive: form.value.isNotice ? form.value.isActive : true,
      expiryDate: form.value.isNotice && form.value.expiryDate ?
          new Date(form.value.expiryDate).toISOString() : null,
      sendNotification: form.value.isNotice ? form.value.sendNotification : false
    }

    const newPost = await postStore.createPost(postData)
    createdPostId = newPost?.id || newPost?.posts?.id

    if (!createdPostId || isNaN(createdPostId)) {
      throw new Error(`${postType}이 생성되었지만 ID를 가져올 수 없습니다.`)
    }

    // 파일 업로드
    if (validFiles.value.length > 0) {
      submissionStatus.value = {
        title: '파일 업로드 중...',
        message: `${validFiles.value.length}개 파일을 업로드하고 있습니다.`,
        showProgress: true
      }

      const progressInterval = setInterval(() => {
        if (uploadProgress.value < 90) {
          uploadProgress.value += 15
        }
      }, 200)

      try {
        await fileStore.uploadFiles(createdPostId, validFiles.value)
        clearInterval(progressInterval)
        uploadProgress.value = 100

        await modalStore.showSuccess(
            `${postType}이 작성되었습니다! (첨부파일 ${validFiles.value.length}개 포함)`
        )
      } catch (fileError) {
        clearInterval(progressInterval)
        await modalStore.showWarning(
            `${postType}은 작성되었지만 일부 파일 업로드에 실패했습니다.`
        )
      }
    } else {
      await modalStore.showSuccess(`${postType}이 작성되었습니다!`)
    }

    isSubmitted.value = true

    // 페이지 이동
    await new Promise(resolve => setTimeout(resolve, 500))
    await router.push(`/posts/${createdPostId}`)

  } catch (error) {
    console.error('Post creation error:', error)
    const postType = form.value.isNotice ?
        (form.value.isPinned ? '중요 공지사항' : '공지사항') :
        '게시글'

    await modalStore.showError(`${postType} 작성에 실패했습니다.`)

    isSubmitting.value = false
    uploadProgress.value = 0
    submissionStatus.value = {title: '', message: '', showProgress: false}
  }
}

// 페이지 이탈 방지
const hasUnsavedChanges = computed(() => {
  if (isSubmitted.value || isSubmitting.value) return false
  return form.value.title.trim() || form.value.content.trim() ||
      form.value.author.trim() || selectedFiles.value.length > 0
})

onBeforeRouteLeave(async (to, from, next) => {
  if (isSubmitted.value) {
    next()
    return
  }

  if (isSubmitting.value) {
    await modalStore.showWarning('게시글 작성이 진행 중입니다.')
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

// 브라우저 새로고침 방지
onMounted(() => {
  const handleBeforeUnload = (e) => {
    if (isSubmitted.value || isSubmitting.value) return
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

// SEO
useHead({
  title: '새 게시글 작성',
  meta: [
    {name: 'description', content: '새로운 게시글이나 공지사항을 작성합니다.'}
  ]
})
</script>

<style scoped>
/* 슬라이드 다운 애니메이션 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 500px;
  opacity: 1;
  transform: translateY(0);
}

/* 포커스 스타일 개선 */
input:focus,
textarea:focus,
select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 체크박스 스타일 */
input[type="checkbox"]:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

/* 반응형 */
@media (max-width: 768px) {
  .max-w-4xl {
    max-width: none;
  }

  .px-6 {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .space-x-4 > * + * {
    margin-left: 0;
    margin-top: 1rem;
  }

  .flex.justify-end.space-x-4 {
    flex-direction: column;
  }

  .md\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>