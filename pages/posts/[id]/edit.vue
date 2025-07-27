<template>
  <div>
    <div v-if="loading && !currentPost" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">로딩 중...</p>
    </div>

    <div v-else-if="error" class="card text-center py-8">
      <p class="text-red-600 mb-4">{{ error }}</p>
      <div class="bg-gray-100 p-4 rounded mb-4 text-left">
        <p><strong>디버깅 정보:</strong></p>
        <p>게시글 ID: {{ postId }}</p>
        <p>현재 상태: {{ currentPost ? '데이터 있음' : '데이터 없음' }}</p>
        <p>로딩 상태: {{ loading }}</p>
      </div>
      <NuxtLink to="/" class="btn-primary">목록으로 돌아가기</NuxtLink>
    </div>

    <div v-else-if="currentPost && currentPost.post">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">게시글 수정</h1>
        <p class="text-sm text-gray-500 mt-1">
          게시글 정보를 수정하고 첨부파일을 관리할 수 있습니다.
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- 기본 정보 수정 -->
        <div class="card">
          <div class="space-y-4">
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

            <!-- 게시글 메타 정보 -->
            <div class="bg-gray-50 p-4 rounded-lg border">
              <h3 class="text-sm font-medium text-gray-700 mb-2">게시글 정보</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                <div class="flex items-center">
                  <Icon name="user" size="sm" class="mr-2" />
                  <span>작성자: {{ currentPost.post.author }}</span>
                </div>
                <div class="flex items-center">
                  <Icon name="calendar" size="sm" class="mr-2" />
                  <span>작성일: {{ formatDate(currentPost.post.createdAt) }}</span>
                </div>
                <div v-if="currentPost.post.updatedAt !== currentPost.post.createdAt" class="flex items-center">
                  <Icon name="edit" size="sm" class="mr-2" />
                  <span>최종 수정일: {{ formatDate(currentPost.post.updatedAt) }}</span>
                </div>
                <div class="flex items-center">
                  <Icon name="eye" size="sm" class="mr-2" />
                  <span>조회수: {{ currentPost.post.viewCount || 0 }}회</span>
                </div>
              </div>
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

        <!-- 수정 완료 버튼 -->
        <div class="flex justify-end space-x-4">
          <NuxtLink :to="`/posts/${postId}`" class="btn-secondary">
            취소
          </NuxtLink>
          <button
              type="submit"
              class="btn-primary"
              :disabled="loading || isSubmitting || !form.title.trim() || !form.content.trim()"
          >
            {{ submitButtonText }}
          </button>
        </div>

        <!-- 제출 진행 상태 -->
        <div v-if="isSubmitting" class="card bg-blue-50 border-blue-200">
          <div class="flex items-center space-x-3">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <div>
              <p class="font-medium text-blue-900">게시글 수정 중</p>
              <p class="text-sm text-blue-700">변경사항을 저장하고 있습니다...</p>
            </div>
          </div>
        </div>
      </form>

      <!-- 파일 미리보기 모달 (필요시) -->
      <div v-if="previewingFile">
        <FilePreview
            :file="previewingFile"
            @close="closeFilePreview"
        />
      </div>
    </div>

    <div v-else class="card text-center py-8">
      <p class="text-gray-600 mb-4">게시글을 찾을 수 없습니다.</p>
      <NuxtLink to="/" class="btn-primary">목록으로 돌아가기</NuxtLink>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const modalStore = useModalStore()
const postStore = usePostStore()

// 파일 store 안전하게 초기화
let fileStore = null
try {
  fileStore = useFileStore()
} catch (error) {
  console.warn('FileStore initialization failed:', error)
}

const { currentPost, loading, error } = storeToRefs(postStore)

// 상태
const isSubmitting = ref(false)
const previewingFile = ref(null)

// 게시글 ID 가져오기
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

console.log('Edit page - Post ID:', postId.value)

// 폼 데이터 초기화
const form = ref({
  title: '',
  content: ''
})

// 계산된 속성
const submitButtonText = computed(() => {
  if (isSubmitting.value) return '수정 중...'
  return '수정 완료'
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
    form.value = {
      title: newPost.post.title || '',
      content: newPost.post.content || ''
    }
    console.log('Form initialized:', form.value)
  }
}, { immediate: true })

// 파일 관련 이벤트 핸들러 (안전하게 처리)
const handleFilesUploaded = async (fileCount) => {
  try {
    console.log('Files uploaded:', fileCount)

    // 게시글 파일 카운트 업데이트
    if (currentPost.value) {
      currentPost.value.fileCount = (currentPost.value.fileCount || 0) + fileCount
    }

    await modalStore.showSuccess(`${fileCount}개 파일이 업로드되었습니다.`)
  } catch (error) {
    console.warn('Error handling file upload:', error)
  }
}

const handleFileDeleted = async (fileId) => {
  try {
    console.log('File deleted:', fileId)

    // 게시글 파일 카운트 업데이트
    if (currentPost.value) {
      currentPost.value.fileCount = Math.max(0, (currentPost.value.fileCount || 0) - 1)
    }
  } catch (error) {
    console.warn('Error handling file deletion:', error)
  }
}

const handleFilePreview = (file) => {
  try {
    console.log('Preview file:', file.originalName)
    previewingFile.value = file
  } catch (error) {
    console.warn('Error handling file preview:', error)
  }
}

const closeFilePreview = () => {
  previewingFile.value = null
}

// 폼 제출 처리
const handleSubmit = async () => {
  if (!form.value.title.trim() || !form.value.content.trim()) {
    await modalStore.showError('제목과 내용을 모두 입력해주세요.')
    return
  }

  try {
    isSubmitting.value = true
    console.log('Submitting form:', form.value)

    await postStore.updatePost(postId.value, form.value)
    console.log('Post updated successfully')

    await modalStore.showSuccess('게시글이 수정되었습니다.')
    await router.push(`/posts/${postId.value}`)

  } catch (error) {
    console.error('Update error:', error)
    await modalStore.showError('게시글 수정에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

// 날짜 포맷팅
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

// 페이지 이탈 시 경고
const hasUnsavedChanges = computed(() => {
  if (!currentPost.value?.post) return false

  return (form.value.title !== currentPost.value.post.title ||
          form.value.content !== currentPost.value.post.content) &&
      !isSubmitting.value
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