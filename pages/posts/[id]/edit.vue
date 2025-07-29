<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 헤더 -->
    <div class="bg-white border-b border-gray-200 mb-8">
      <div class="max-w-4xl mx-auto px-6 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">게시글 수정</h1>
            <p class="text-gray-600 mt-2">게시글 정보를 수정하고 첨부파일을 관리하세요</p>
          </div>
          <div class="hidden md:block">
            <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <Icon name="edit" size="lg" color="blue" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading && !currentPost" class="max-w-4xl mx-auto px-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">게시글을 불러오는 중...</p>
        </div>
      </div>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="max-w-4xl mx-auto px-6">
      <div class="bg-white rounded-lg shadow-sm border border-red-200 p-8">
        <div class="text-center">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="warning" size="lg" color="red" />
          </div>
          <h3 class="text-lg font-semibold text-red-900 mb-2">오류가 발생했습니다</h3>
          <p class="text-red-600 mb-6">{{ error }}</p>
          <div class="space-x-4">
            <button @click="retryLoad" class="btn-primary">다시 시도</button>
            <NuxtLink to="/" class="btn-secondary">목록으로 돌아가기</NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- 메인 컨텐츠 -->
    <div v-else-if="currentPost && currentPost.post" class="max-w-4xl mx-auto px-6 pb-12">
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
                공지사항으로 설정
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
                    활성화
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

              <!-- 공지사항 미리보기 -->
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center space-x-2 text-sm">
                  <span class="text-gray-600">미리보기:</span>
                  <span v-if="form.isPinned" class="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
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

          <!-- 게시글 메타 정보 -->
          <div v-if="currentPost.post" class="mt-6 pt-6 border-t border-gray-100">
            <h3 class="text-sm font-medium text-gray-700 mb-4">게시글 정보</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
              <div class="flex items-center">
                <Icon name="calendar" size="sm" class="mr-2 text-gray-400" />
                <span>작성일: {{ formatDate(currentPost.post.createdAt) }}</span>
              </div>
              <div v-if="currentPost.post.updatedAt !== currentPost.post.createdAt" class="flex items-center">
                <Icon name="edit" size="sm" class="mr-2 text-gray-400" />
                <span>최종 수정일: {{ formatDate(currentPost.post.updatedAt) }}</span>
              </div>
              <div class="flex items-center">
                <Icon name="eye" size="sm" class="mr-2 text-gray-400" />
                <span>조회수: {{ currentPost.post.viewCount || 0 }}회</span>
              </div>
              <div class="flex items-center">
                <Icon name="message" size="sm" class="mr-2 text-gray-400" />
                <span>댓글: {{ currentPost.commentCount || 0 }}개</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 첨부파일 관리 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900">첨부파일 관리</h2>
            <span class="text-sm text-gray-500">
              {{ selectedFiles.length + existingFileCount }}개 파일
            </span>
          </div>

          <!-- 기존 파일 목록 -->
          <div v-if="hasExistingFiles" class="mb-6">
            <h3 class="text-sm font-medium text-gray-700 mb-4">기존 첨부파일</h3>
            <Suspense>
              <template #default>
                <ClientOnly fallback-tag="div" fallback="파일 목록을 불러오는 중...">
                  <FileListReadonly
                      :post-id="postId"
                      :can-delete="true"
                      @file-deleted="handleExistingFileDeleted"
                      @file-previewed="handleFilePreview"
                  />
                </ClientOnly>
              </template>
              <template #fallback>
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div class="text-center">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p class="mt-2 text-sm text-gray-600">기존 파일 목록 로딩 중...</p>
                  </div>
                </div>
              </template>
            </Suspense>
          </div>

          <!-- 새 파일 업로드 영역 -->
          <div class="space-y-4">
            <h3 class="text-sm font-medium text-gray-700">새 파일 추가</h3>

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

            <!-- 선택된 새 파일 목록 -->
            <div v-if="selectedFiles.length > 0" class="space-y-3">
              <h4 class="text-sm font-medium text-gray-700">새로 추가될 파일 ({{ selectedFiles.length }}개)</h4>

              <div class="space-y-2">
                <div
                    v-for="(file, index) in selectedFiles"
                    :key="`new-file-${index}`"
                    class="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
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
                        class="text-gray-400 hover:text-red-500 transition-colors"
                        :disabled="isSubmitting"
                    >
                      <Icon name="close" size="sm" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- 새 파일 요약 -->
              <div class="flex justify-between items-center pt-3 border-t border-blue-200 text-sm">
                <span class="text-blue-800">
                  {{ selectedFiles.length }}개 새 파일
                  <span v-if="validFiles.length !== selectedFiles.length" class="text-red-600">
                    ({{ selectedFiles.length - validFiles.length }}개 크기 초과)
                  </span>
                </span>
                <button
                    type="button"
                    @click="clearSelectedFiles"
                    class="text-blue-600 hover:text-blue-800 transition-colors"
                    :disabled="isSubmitting"
                >
                  전체 제거
                </button>
              </div>
            </div>
          </div>

          <!-- 파일 관리 안내 -->
          <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex">
              <Icon name="info" size="sm" color="blue" class="mr-2 mt-0.5" />
              <div class="text-sm text-blue-800">
                <p class="font-medium mb-1">파일 업로드 안내</p>
                <ul class="text-xs space-y-1">
                  <li>• 기존 파일은 개별적으로 삭제할 수 있습니다</li>
                  <li>• 새 파일은 저장 시 함께 업로드됩니다</li>
                  <li>• 최대 파일 크기: {{ formatFileSize(maxFileSize) }}</li>
                  <li>• 드래그 앤 드롭으로 여러 파일을 한번에 선택할 수 있습니다</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 제출 버튼 -->
        <div class="flex justify-end space-x-4">
          <NuxtLink :to="`/posts/${postId}`" class="btn-secondary" :class="{ 'opacity-50 pointer-events-none': isSubmitting }">
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
              {{ submissionStatus.title || '수정 중...' }}
            </span>
            <span v-else>
              {{ submitButtonText }}
            </span>
          </button>
        </div>
      </form>
    </div>

    <!-- 게시글을 찾을 수 없는 경우 -->
    <div v-else class="max-w-4xl mx-auto px-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div class="text-center">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="file" size="lg" color="gray" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">게시글을 찾을 수 없습니다</h3>
          <p class="text-gray-600 mb-6">요청하신 게시글이 존재하지 않거나 삭제되었을 수 있습니다.</p>
          <div class="space-x-4">
            <button @click="retryLoad" class="btn-secondary">다시 시도</button>
            <NuxtLink to="/" class="btn-primary">목록으로 돌아가기</NuxtLink>
          </div>
        </div>
      </div>
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

    <!-- 파일 미리보기 모달 -->
    <div v-if="previewingFile">
      <FilePreview
          :file="previewingFile"
          @close="closeFilePreview"
      />
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
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

const { currentPost, loading, error } = storeToRefs(postStore)

// 설정값
const maxFileSize = computed(() => config.public.maxFileSize || 50 * 1024 * 1024)
const maxFiles = computed(() => config.public.maxFiles || 20)

// 게시글 ID
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

// 참조
const fileInput = ref(null)

// 상태
const isSubmitting = ref(false)
const selectedFiles = ref([])
const isDragOver = ref(false)
const uploadProgress = ref(0)
const previewingFile = ref(null)
const existingFileCount = ref(0)

const submissionStatus = ref({
  title: '',
  message: '',
  showProgress: false
})

// 폼 데이터 초기화
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
    return form.value.isPinned ? '중요 공지사항 수정' : '공지사항 수정'
  }
  return '게시글 수정'
})

const hasExistingFiles = computed(() => {
  return existingFileCount.value > 0
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
    const post = newPost.post
    form.value = {
      title: post.title || '',
      content: post.content || '',
      author: post.author || '',
      isNotice: post.isNotice || false,
      isPinned: post.isPinned || false,
      isActive: post.isActive !== undefined ? post.isActive : true,
      expiryDate: post.expiryDate ? formatDateTimeForInput(post.expiryDate) : '',
      sendNotification: false // 수정 시에는 기본적으로 false
    }

    existingFileCount.value = newPost.fileCount || 0
    console.log('Form initialized:', form.value)
  }
}, { immediate: true })

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

const formatDateTimeForInput = (dateTimeString) => {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
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

  const remainingSlots = maxFiles.value - selectedFiles.value.length - existingFileCount.value
  const filesToAdd = newFiles.slice(0, Math.max(0, remainingSlots))

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

// 기존 파일 관련 이벤트 핸들러
const handleExistingFileDeleted = (fileId) => {
  console.log('Existing file deleted:', fileId)
  existingFileCount.value = Math.max(0, existingFileCount.value - 1)
}

const handleFilePreview = (file) => {
  console.log('Preview file:', file.originalName)
  previewingFile.value = file
}

const closeFilePreview = () => {
  previewingFile.value = null
}

// 재시도 함수
const retryLoad = async () => {
  console.log('Retrying to load post...')
  try {
    await postStore.fetchPostById(postId.value)
  } catch (err) {
    console.error('Retry failed:', err)
  }
}

// 폼 제출 처리
const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return

  try {
    isSubmitting.value = true

    const postType = form.value.isNotice ?
        (form.value.isPinned ? '중요 공지사항' : '공지사항') :
        '게시글'

    submissionStatus.value = {
      title: `${postType} 수정 중...`,
      message: `${postType}을 저장하고 있습니다.`,
      showProgress: false
    }

    // 게시글 수정
    const updateData = {
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

    await postStore.updatePost(postId.value, updateData)

    // 새 파일 업로드
    if (validFiles.value.length > 0) {
      submissionStatus.value = {
        title: '새 파일 업로드 중...',
        message: `${validFiles.value.length}개 파일을 업로드하고 있습니다.`,
        showProgress: true
      }

      const progressInterval = setInterval(() => {
        if (uploadProgress.value < 90) {
          uploadProgress.value += 15
        }
      }, 200)

      try {
        await fileStore.uploadFiles(postId.value, validFiles.value)
        clearInterval(progressInterval)
        uploadProgress.value = 100

        await modalStore.showSuccess(
            `${postType}이 수정되었습니다! (새 파일 ${validFiles.value.length}개 추가)`
        )
      } catch (fileError) {
        clearInterval(progressInterval)
        console.error('File upload error:', fileError)
        await modalStore.showWarning(
            `${postType}은 수정되었지만 일부 파일 업로드에 실패했습니다.`
        )
      }
    } else {
      await modalStore.showSuccess(`${postType}이 수정되었습니다!`)
    }

    // 페이지 이동
    await new Promise(resolve => setTimeout(resolve, 500))
    await router.push(`/posts/${postId.value}`)

  } catch (error) {
    console.error('Post update error:', error)
    const postType = form.value.isNotice ?
        (form.value.isPinned ? '중요 공지사항' : '공지사항') :
        '게시글'

    await modalStore.showError(`${postType} 수정에 실패했습니다.`)
  } finally {
    isSubmitting.value = false
    uploadProgress.value = 0
    submissionStatus.value = {title: '', message: '', showProgress: false}
  }
}

// 페이지 이탈 방지
const hasUnsavedChanges = computed(() => {
  if (!currentPost.value?.post || isSubmitting.value) return false

  const original = currentPost.value.post
  return (
      form.value.title !== (original.title || '') ||
      form.value.content !== (original.content || '') ||
      form.value.author !== (original.author || '') ||
      form.value.isNotice !== (original.isNotice || false) ||
      form.value.isPinned !== (original.isPinned || false) ||
      form.value.isActive !== (original.isActive !== undefined ? original.isActive : true) ||
      selectedFiles.value.length > 0
  )
})

onBeforeRouteLeave(async (to, from, next) => {
  if (isSubmitting.value) {
    await modalStore.showWarning('게시글 수정이 진행 중입니다. 잠시만 기다려주세요.')
    next(false)
    return
  }

  if (hasUnsavedChanges.value) {
    const confirmed = await modalStore.showConfirm(
        '수정 중인 내용이 있습니다. 정말 나가시겠습니까?'
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

  .md\:w-auto {
    width: 100%;
  }
}

/* 로딩 애니메이션 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 파일 드래그 오버 효과 */
.border-blue-400 {
  border-color: #60a5fa;
}

.bg-blue-50 {
  background-color: #eff6ff;
}
</style>