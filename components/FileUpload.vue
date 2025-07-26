<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold text-gray-900">
      첨부파일 ({{ files.length }})
    </h3>

    <!-- 파일 업로드 영역 -->
    <div
        class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors"
        :class="{ 'border-blue-400 bg-blue-50': isDragOver }"
        @drop="handleDrop"
        @dragover.prevent="isDragOver = true"
        @dragleave="isDragOver = false"
        @dragenter.prevent
    >
      <div class="text-center">
        <input
            ref="fileInput"
            type="file"
            multiple
            accept="*/*"
            @change="handleFileSelect"
            class="hidden"
        />

        <!-- 드래그 앤 드롭 아이콘 -->
        <Icon name="upload" size="xl" color="gray" class="mx-auto mb-4" />

        <button
            @click="$refs.fileInput.click()"
            class="btn-primary mb-2"
            :disabled="uploading"
        >
          {{ uploading ? '업로드 중...' : '파일 선택' }}
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

    <!-- 선택된 파일 목록 (업로드 전) -->
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
            <Icon :name="getFileIcon(file.type)" size="sm" color="blue" />
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
                @click="removeSelectedFile(index)"
                class="text-red-600 hover:text-red-800 p-1"
                title="제거"
            >
              <Icon name="close" size="sm" />
            </button>
          </div>
        </div>
      </div>

      <!-- 업로드 버튼 및 상태 -->
      <div class="flex justify-between items-center pt-2">
        <div class="text-sm text-gray-500">
          <span v-if="validFiles.length !== selectedFiles.length" class="text-red-600">
            {{ selectedFiles.length - validFiles.length }}개 파일이 크기 제한을 초과합니다
          </span>
        </div>

        <div class="space-x-2">
          <button
              @click="clearSelectedFiles"
              class="btn-secondary text-sm"
          >
            전체 제거
          </button>
          <button
              @click="uploadFiles"
              class="btn-primary text-sm"
              :disabled="uploading || validFiles.length === 0"
          >
            {{ uploading ? `업로드 중... (${uploadProgress}%)` : `업로드 (${validFiles.length}개)` }}
          </button>
        </div>
      </div>

      <!-- 업로드 진행률 -->
      <div v-if="uploading" class="w-full bg-gray-200 rounded-full h-2">
        <div
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: uploadProgress + '%' }"
        ></div>
      </div>
    </div>

    <!-- 업로드된 파일 목록 -->
    <div v-if="files.length > 0" class="space-y-2">
      <h4 class="font-medium text-gray-900 flex items-center">
        <Icon name="attachment" size="sm" class="mr-2" />
        첨부파일 ({{ files.length }}개):
      </h4>

      <div class="space-y-2 max-h-60 overflow-y-auto">
        <div
            v-for="file in files"
            :key="`uploaded-${file.id}`"
            class="flex justify-between items-center bg-white border p-3 rounded hover:shadow-sm transition-shadow"
        >
          <div class="flex items-center space-x-3 flex-1 min-w-0">
            <Icon :name="getFileIcon(file.originalName)" size="sm" color="green" />
            <div class="min-w-0 flex-1">
              <p class="font-medium text-gray-900 truncate">{{ file.originalName }}</p>
              <div class="flex items-center space-x-2 text-xs text-gray-500">
                <span>{{ formatFileSize(file.fileSize) }}</span>
                <span>•</span>
                <span>{{ formatDate(file.createdAt) }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <a
                :href="getDownloadUrl(file.storedName)"
                target="_blank"
                class="text-blue-600 hover:text-blue-800 p-1"
                title="다운로드"
                @click="trackDownload(file)"
            >
              <Icon name="download" size="sm" />
            </a>
            <button
                @click="deleteFile(file.id)"
                class="text-red-600 hover:text-red-800 p-1"
                title="삭제"
                :disabled="deleting === file.id"
            >
              <Icon name="delete" size="sm" />
            </button>
          </div>
        </div>
      </div>

      <!-- 파일 통계 -->
      <div class="text-sm text-gray-500 bg-gray-50 p-2 rounded">
        총 {{ files.length }}개 파일 • {{ formatTotalSize(files) }}
      </div>
    </div>

    <!-- 빈 상태 (파일이 없고 선택된 파일도 없을 때만 표시) -->
    <div v-else-if="selectedFiles.length === 0" class="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
      <Icon name="attachment" size="lg" color="gray" class="mx-auto mb-2" />
      <p class="text-sm">첨부된 파일이 없습니다.</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  postId: {
    type: [Number, String],
    default: null
  },
  maxFiles: {
    type: Number,
    default: 10
  },
  maxFileSize: {
    type: Number,
    default: 10 * 1024 * 1024 // 10MB
  },
  allowedTypes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['files-uploaded', 'file-deleted'])

const modalStore = useModalStore()
const fileStore = useFileStore()
const { files, loading } = storeToRefs(fileStore)

// 로컬 상태
const selectedFiles = ref([])
const uploading = ref(false)
const uploadProgress = ref(0)
const deleting = ref(null)
const isDragOver = ref(false)

// 파일 목록 로드 (postId가 있을 때만)
if (props.postId) {
  await fileStore.fetchFilesByPostId(props.postId)
}

// 유효한 파일들만 필터링
const validFiles = computed(() => {
  return selectedFiles.value.filter(file =>
      file.size <= props.maxFileSize &&
      (props.allowedTypes.length === 0 || props.allowedTypes.includes(file.type))
  )
})

// 파일 아이콘 결정
const getFileIcon = (fileName) => {
  if (!fileName) return 'file'

  const extension = fileName.split('.').pop()?.toLowerCase()

  const iconMap = {
    // 이미지
    jpg: 'eye', jpeg: 'eye', png: 'eye', gif: 'eye', bmp: 'eye', svg: 'eye',
    // 문서
    pdf: 'file', doc: 'file', docx: 'file', txt: 'file', rtf: 'file',
    // 스프레드시트
    xls: 'file', xlsx: 'file', csv: 'file',
    // 프레젠테이션
    ppt: 'file', pptx: 'file',
    // 압축
    zip: 'file', rar: 'file', '7z': 'file', tar: 'file', gz: 'file',
    // 코드
    js: 'file', html: 'file', css: 'file', json: 'file', xml: 'file',
    // 기타
    mp3: 'file', mp4: 'file', avi: 'file', mov: 'file'
  }

  return iconMap[extension] || 'file'
}

// 파일 선택 처리
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  addFiles(files)

  // 입력 초기화
  event.target.value = ''
}

// 드래그 앤 드롭 처리
const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false

  const files = Array.from(event.dataTransfer.files)
  addFiles(files)
}

// 파일 추가
const addFiles = (files) => {
  // 중복 파일 체크
  const newFiles = files.filter(file => {
    return !selectedFiles.value.some(selected =>
        selected.name === file.name && selected.size === file.size
    )
  })

  // 최대 파일 수 체크
  const remainingSlots = props.maxFiles - selectedFiles.value.length
  const filesToAdd = newFiles.slice(0, remainingSlots)

  if (filesToAdd.length < newFiles.length) {
    modalStore.showWarning(`최대 ${props.maxFiles}개 파일만 업로드할 수 있습니다.`)
  }

  selectedFiles.value = [...selectedFiles.value, ...filesToAdd]
}

// 선택된 파일 제거
const removeSelectedFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

// 선택된 파일 전체 제거
const clearSelectedFiles = () => {
  selectedFiles.value = []
}

// 파일 업로드
const uploadFiles = async () => {
  if (validFiles.value.length === 0) return

  if (!props.postId) {
    modalStore.showError('게시글이 저장된 후 파일을 업로드할 수 있습니다.')
    return
  }

  try {
    uploading.value = true
    uploadProgress.value = 0

    // 진행률 시뮬레이션 (실제로는 서버에서 진행률을 받아야 함)
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 200)

    await fileStore.uploadFiles(props.postId, validFiles.value)

    clearInterval(progressInterval)
    uploadProgress.value = 100

    // 성공 처리
    selectedFiles.value = []
    emit('files-uploaded', validFiles.value.length)

    modalStore.showSuccess(`${validFiles.value.length}개 파일이 업로드되었습니다.`)

  } catch (error) {
    console.error('Upload error:', error)
    modalStore.showError('파일 업로드에 실패했습니다.')
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

// 파일 삭제
const deleteFile = async (fileId) => {
  if (await modalStore.showConfirm('정말 삭제하시겠습니까?')) {
    try {
      deleting.value = fileId
      await fileStore.deleteFile(fileId, props.postId)
      emit('file-deleted', fileId)
    } catch (error) {
      modalStore.showError('파일 삭제에 실패했습니다.')
    } finally {
      deleting.value = null
    }
  }
}

// 다운로드 URL 가져오기
const getDownloadUrl = (storedName) => {
  return fileStore.getDownloadUrl(storedName)
}

// 다운로드 추적
const trackDownload = (file) => {
  console.log('File downloaded:', file.originalName)
}

// 파일 크기 포맷팅
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ko-KR')
}

// 총 파일 크기 계산
const formatTotalSize = (fileList) => {
  const totalSize = fileList.reduce((sum, file) => sum + (file.fileSize || 0), 0)
  return formatFileSize(totalSize)
}

// 컴포넌트 언마운트 시 정리
onUnmounted(() => {
  selectedFiles.value = []
})
</script>

<style scoped>
.transition-colors {
  transition: border-color 0.2s ease-in-out, background-color 0.2s ease-in-out;
}
</style>