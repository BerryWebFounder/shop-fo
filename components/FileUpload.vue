<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold text-gray-900">
      첨부파일 ({{ files.length }})
    </h3>

    <!-- 파일 업로드 영역 -->
    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
      <div class="text-center">
        <input
            ref="fileInput"
            type="file"
            multiple
            @change="handleFileSelect"
            class="hidden"
        />
        <button
            @click="$refs.fileInput.click()"
            class="btn-primary"
            :disabled="loading"
        >
          {{ loading ? '업로드 중...' : '파일 선택' }}
        </button>
        <p class="mt-2 text-sm text-gray-500">
          여러 파일을 선택할 수 있습니다.
        </p>
      </div>
    </div>

    <!-- 선택된 파일 목록 -->
    <div v-if="selectedFiles.length > 0" class="space-y-2">
      <h4 class="font-medium text-gray-900">선택된 파일:</h4>
      <div class="space-y-2">
        <div
            v-for="(file, index) in selectedFiles"
            :key="index"
            class="flex justify-between items-center bg-gray-50 p-3 rounded"
        >
          <span class="text-sm">{{ file.name }}</span>
          <button
              @click="removeSelectedFile(index)"
              class="text-red-600 hover:text-red-800 text-sm"
          >
            제거
          </button>
        </div>
      </div>
      <button
          @click="uploadFiles"
          class="btn-primary w-full"
          :disabled="loading"
      >
        {{ loading ? '업로드 중...' : '업로드' }}
      </button>
    </div>

    <!-- 업로드된 파일 목록 -->
    <div v-if="files.length > 0" class="space-y-2">
      <h4 class="font-medium text-gray-900">업로드된 파일:</h4>
      <div class="space-y-2">
        <div
            v-for="file in files"
            :key="file.id"
            class="flex justify-between items-center bg-white border p-3 rounded"
        >
          <div class="flex-1">
            <p class="font-medium">{{ file.originalName }}</p>
            <p class="text-sm text-gray-500">
              {{ formatFileSize(file.fileSize) }} •
              {{ formatDate(file.createdAt) }}
            </p>
          </div>
          <div class="flex space-x-2">
            <a
                :href="fileStore.getDownloadUrl(file.storedName)"
                target="_blank"
                class="text-blue-600 hover:text-blue-800 text-sm"
            >
              다운로드
            </a>
            <button
                @click="deleteFile(file.id)"
                class="text-red-600 hover:text-red-800 text-sm"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  postId: {
    type: Number,
    required: true
  }
})

const fileStore = useFileStore()
const { files, loading } = storeToRefs(fileStore)

const selectedFiles = ref([])

// 파일 목록 로드
await fileStore.fetchFilesByPostId(props.postId)

// 파일 선택 처리
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  selectedFiles.value = [...selectedFiles.value, ...files]
}

// 선택된 파일 제거
const removeSelectedFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

// 파일 업로드
const uploadFiles = async () => {
  if (selectedFiles.value.length === 0) return

  try {
    await fileStore.uploadFiles(props.postId, selectedFiles.value)
    selectedFiles.value = []

    // 파일 입력 초기화
    const fileInput = document.querySelector('input[type="file"]')
    if (fileInput) fileInput.value = ''
  } catch (error) {
    alert('파일 업로드에 실패했습니다.')
  }
}

// 파일 삭제
const deleteFile = async (fileId) => {
  if (confirm('정말 삭제하시겠습니까?')) {
    try {
      await fileStore.deleteFile(fileId, props.postId)
    } catch (error) {
      alert('파일 삭제에 실패했습니다.')
    }
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ko-KR')
}
</script>