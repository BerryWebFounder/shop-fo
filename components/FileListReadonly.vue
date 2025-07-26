<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold text-gray-900 flex items-center">
        <Icon name="attachment" size="sm" class="mr-2" />
        첨부파일 ({{ files.length }})
      </h3>

      <!-- 파일 총 크기 표시 -->
      <div v-if="files.length > 0" class="text-sm text-gray-500">
        총 {{ formatTotalSize(files) }}
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="text-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-sm text-gray-600">파일 목록 로딩 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="text-center py-4 text-red-600">
      <Icon name="close" size="md" class="mx-auto mb-2" />
      <p class="text-sm">파일 목록을 불러오는데 실패했습니다.</p>
      <button @click="retry" class="mt-2 text-xs text-blue-600 hover:text-blue-800">
        다시 시도
      </button>
    </div>

    <!-- 파일 목록 -->
    <div v-else-if="files.length > 0" class="space-y-2">
      <div class="space-y-2 max-h-60 overflow-y-auto">
        <div
            v-for="file in files"
            :key="file.id"
            class="flex justify-between items-center bg-white border border-gray-200 p-3 rounded-lg hover:shadow-sm transition-shadow"
        >
          <div class="flex items-center space-x-3 flex-1 min-w-0">
            <div class="flex-shrink-0">
              <Icon :name="getFileIcon(file.originalName)" size="sm" :color="getFileColor(file.originalName)" />
            </div>

            <div class="min-w-0 flex-1">
              <p class="font-medium text-gray-900 truncate" :title="file.originalName">
                {{ file.originalName }}
              </p>
              <div class="flex items-center space-x-2 text-xs text-gray-500">
                <span>{{ formatFileSize(file.fileSize) }}</span>
                <span>•</span>
                <span>{{ getFileType(file.originalName) }}</span>
                <span>•</span>
                <span>{{ formatDate(file.createdAt) }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <!-- 미리보기 버튼 (지원되는 파일만) -->
            <button
                v-if="canPreview(file)"
                @click="previewFile(file)"
                class="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                title="미리보기"
            >
              <Icon name="eye" size="sm" />
            </button>

            <!-- 다운로드 버튼 -->
            <a
                :href="getDownloadUrl(file.storedName)"
                target="_blank"
                class="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                title="다운로드"
                @click="trackDownload(file)"
            >
              <Icon name="download" size="sm" />
            </a>

            <!-- 관리자 권한이 있을 때만 삭제 버튼 표시 -->
            <button
                v-if="canDelete"
                @click="deleteFile(file.id)"
                class="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                title="삭제"
                :disabled="deleting === file.id"
            >
              <Icon name="delete" size="sm" />
            </button>
          </div>
        </div>
      </div>

      <!-- 파일 통계 -->
      <div class="flex justify-between items-center text-sm text-gray-500 bg-gray-50 p-3 rounded">
        <span>{{ files.length }}개 파일</span>
        <span>{{ formatTotalSize(files) }}</span>
      </div>
    </div>

    <!-- 빈 상태 -->
    <div v-else class="text-center py-8 text-gray-500">
      <Icon name="attachment" size="xl" color="gray" class="mx-auto mb-3" />
      <p class="text-sm">첨부된 파일이 없습니다.</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  postId: {
    type: [Number, String],
    required: true
  },
  canDelete: {
    type: Boolean,
    default: false
  },
  canUpload: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['file-deleted', 'file-previewed'])

const modalStore = useModalStore()
const fileStore = useFileStore()
const { files, loading, error } = storeToRefs(fileStore)

// 상태
const deleting = ref(null)

// 파일 목록 로드
onMounted(async () => {
  if (props.postId) {
    await retry()
  }
})

// 재시도
const retry = async () => {
  try {
    await fileStore.fetchFilesByPostId(props.postId)
  } catch (err) {
    console.error('Failed to load files:', err)
  }
}

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
    // 압축
    zip: 'file', rar: 'file', '7z': 'file',
    // 기타
    mp3: 'file', mp4: 'file', avi: 'file'
  }

  return iconMap[extension] || 'file'
}

// 파일 타입별 색상
const getFileColor = (fileName) => {
  if (!fileName) return 'gray'

  const extension = fileName.split('.').pop()?.toLowerCase()

  const colorMap = {
    // 이미지
    jpg: 'green', jpeg: 'green', png: 'green', gif: 'green', bmp: 'green', svg: 'green',
    // 문서
    pdf: 'red', doc: 'blue', docx: 'blue', txt: 'gray',
    // 스프레드시트
    xls: 'green', xlsx: 'green', csv: 'green',
    // 압축
    zip: 'purple', rar: 'purple',
    // 미디어
    mp3: 'yellow', mp4: 'yellow'
  }

  return colorMap[extension] || 'gray'
}

// 파일 타입 문자열
const getFileType = (fileName) => {
  if (!fileName) return 'Unknown'

  const extension = fileName.split('.').pop()?.toUpperCase()
  return extension || 'Unknown'
}

// 미리보기 가능 여부
const canPreview = (file) => {
  const fileName = file.originalName || ''
  const extension = fileName.split('.').pop()?.toLowerCase()

  const previewableTypes = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'pdf', 'txt', 'md']
  return previewableTypes.includes(extension)
}

// 파일 미리보기
const previewFile = (file) => {
  emit('file-previewed', file)
  // 실제 미리보기 모달 구현은 부모 컴포넌트에서 처리
}

// 파일 삭제
const deleteFile = async (fileId) => {
  if (!props.canDelete) return

  const confirmed = await modalStore.showConfirm('정말 삭제하시겠습니까?')
  if (!confirmed) return

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

// 다운로드 URL
const getDownloadUrl = (storedName) => {
  return fileStore.getDownloadUrl(storedName)
}

// 다운로드 추적
const trackDownload = (file) => {
  console.log('File downloaded:', file.originalName)
  // 필요시 다운로드 통계 API 호출
}

// 파일 크기 포맷팅
const formatFileSize = (bytes) => {
  return fileStore.formatFileSize(bytes)
}

// 총 파일 크기
const formatTotalSize = (fileList) => {
  const totalSize = fileList.reduce((sum, file) => sum + (file.fileSize || 0), 0)
  return formatFileSize(totalSize)
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ko-KR')
}
</script>