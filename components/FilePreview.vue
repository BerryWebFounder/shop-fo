<template>
  <div>
    <!-- 미리보기 트리거 버튼 -->
    <button
        @click="showPreview = true"
        class="text-blue-600 hover:text-blue-800 p-1"
        title="미리보기"
    >
      <Icon name="eye" size="sm" />
    </button>

    <!-- 미리보기 모달 -->
    <Modal
        :show="showPreview"
        :title="`파일 미리보기 - ${file.originalName}`"
        @close="showPreview = false"
        @cancel="showPreview = false"
    >
      <template #default>
        <div class="max-w-4xl max-h-96 overflow-auto">
          <!-- 이미지 미리보기 -->
          <div v-if="fileType === 'image'" class="text-center">
            <img
                :src="previewUrl"
                :alt="file.originalName"
                class="max-w-full max-h-80 mx-auto rounded"
                @load="onImageLoad"
                @error="onImageError"
            />
            <p class="text-sm text-gray-500 mt-2">
              {{ file.originalName }} ({{ formatFileSize(file.fileSize) }})
            </p>
          </div>

          <!-- 텍스트 파일 미리보기 -->
          <div v-else-if="fileType === 'text'" class="bg-gray-50 p-4 rounded">
            <pre v-if="textContent" class="whitespace-pre-wrap text-sm">{{ textContent }}</pre>
            <div v-else-if="loadingContent" class="text-center py-4">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p class="mt-2 text-gray-600">로딩 중...</p>
            </div>
            <div v-else class="text-center py-4 text-red-600">
              텍스트를 불러올 수 없습니다.
            </div>
          </div>

          <!-- PDF 미리보기 -->
          <div v-else-if="fileType === 'pdf'" class="text-center">
            <iframe
                :src="previewUrl"
                class="w-full h-96 border rounded"
                title="PDF 미리보기"
            ></iframe>
            <p class="text-sm text-gray-500 mt-2">
              PDF 파일을 브라우저에서 직접 보고 있습니다.
            </p>
          </div>

          <!-- 오디오 미리보기 -->
          <div v-else-if="fileType === 'audio'" class="text-center">
            <audio :src="previewUrl" controls class="w-full max-w-md mx-auto">
              Your browser does not support the audio element.
            </audio>
            <p class="text-sm text-gray-500 mt-2">
              {{ file.originalName }} ({{ formatFileSize(file.fileSize) }})
            </p>
          </div>

          <!-- 비디오 미리보기 -->
          <div v-else-if="fileType === 'video'" class="text-center">
            <video :src="previewUrl" controls class="w-full max-w-2xl max-h-80 mx-auto rounded">
              Your browser does not support the video element.
            </video>
            <p class="text-sm text-gray-500 mt-2">
              {{ file.originalName }} ({{ formatFileSize(file.fileSize) }})
            </p>
          </div>

          <!-- 미리보기 불가능한 파일 -->
          <div v-else class="text-center py-8">
            <Icon name="file" size="xl" color="gray" class="mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">{{ file.originalName }}</h3>
            <p class="text-gray-500 mb-4">
              이 파일 형식은 미리보기를 지원하지 않습니다.
            </p>
            <p class="text-sm text-gray-400">
              파일 크기: {{ formatFileSize(file.fileSize) }}<br>
              파일 형식: {{ getFileExtension(file.originalName) }}
            </p>
            <div class="mt-4">
              <a
                  :href="downloadUrl"
                  target="_blank"
                  class="btn-primary"
              >
                <Icon name="download" size="sm" class="mr-2" />
                다운로드
              </a>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-between items-center">
          <div class="flex space-x-2">
            <a
                :href="downloadUrl"
                target="_blank"
                class="btn-secondary"
            >
              <Icon name="download" size="sm" class="mr-2" />
              다운로드
            </a>
          </div>
          <button @click="showPreview = false" class="btn-primary">
            닫기
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
const props = defineProps({
  file: {
    type: Object,
    required: true
  }
})

const fileStore = useFileStore()

// 상태
const showPreview = ref(false)
const textContent = ref('')
const loadingContent = ref(false)

// 계산된 속성
const fileType = computed(() => {
  return fileStore.getFileType(props.file.originalName)
})

const downloadUrl = computed(() => {
  return fileStore.getDownloadUrl(props.file.storedName)
})

const previewUrl = computed(() => {
  // 이미지, PDF, 오디오, 비디오는 직접 URL 사용
  if (['image', 'pdf', 'audio', 'video'].includes(fileType.value)) {
    return downloadUrl.value
  }
  return ''
})

// 파일 확장자 추출
const getFileExtension = (fileName) => {
  return fileName.split('.').pop()?.toUpperCase() || 'Unknown'
}

// 파일 크기 포맷팅
const formatFileSize = (bytes) => {
  return fileStore.formatFileSize(bytes)
}

// 텍스트 파일 내용 로드
const loadTextContent = async () => {
  if (fileType.value !== 'text') return

  loadingContent.value = true
  try {
    const response = await fetch(downloadUrl.value)
    if (response.ok) {
      const text = await response.text()
      // 텍스트가 너무 길면 잘라내기
      textContent.value = text.length > 10000
          ? text.substring(0, 10000) + '\n\n... (파일이 너무 커서 일부만 표시됩니다)'
          : text
    } else {
      throw new Error('Failed to load text content')
    }
  } catch (error) {
    console.error('Error loading text content:', error)
    textContent.value = ''
  } finally {
    loadingContent.value = false
  }
}

// 이미지 로드 성공
const onImageLoad = () => {
  console.log('Image loaded successfully')
}

// 이미지 로드 실패
const onImageError = () => {
  console.error('Failed to load image')
}

// 미리보기 모달이 열릴 때 텍스트 파일 내용 로드
watch(showPreview, (newVal) => {
  if (newVal && fileType.value === 'text') {
    loadTextContent()
  }
})
</script>