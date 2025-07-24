<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">
      댓글 ({{ comments.length }})
    </h3>

    <!-- 댓글 작성 폼 -->
    <form @submit.prevent="submitComment" class="card">
      <div class="mb-4">
        <input
            v-model="newComment.author"
            type="text"
            placeholder="작성자"
            class="form-input mb-3"
            required
        />
        <textarea
            v-model="newComment.content"
            placeholder="댓글을 입력하세요..."
            rows="3"
            class="form-textarea"
            required
        ></textarea>
      </div>
      <div class="flex justify-end">
        <button
            type="submit"
            class="btn-primary"
            :disabled="loading"
        >
          {{ loading ? '작성 중...' : '댓글 작성' }}
        </button>
      </div>
    </form>

    <!-- 댓글 목록 -->
    <div v-if="comments.length > 0" class="space-y-3">
      <div
          v-for="comment in comments"
          :key="comment.id"
          class="bg-gray-50 rounded-lg p-4"
      >
        <div class="flex justify-between items-start mb-2">
          <div class="flex items-center space-x-2">
            <span class="font-medium text-gray-900">{{ comment.author }}</span>
            <span class="text-sm text-gray-500">
              {{ formatDate(comment.createdAt) }}
            </span>
          </div>
          <div class="flex space-x-2">
            <button
                @click="editComment(comment)"
                class="text-sm text-blue-600 hover:text-blue-800"
            >
              수정
            </button>
            <button
                @click="deleteComment(comment.id)"
                class="text-sm text-red-600 hover:text-red-800"
            >
              삭제
            </button>
          </div>
        </div>

        <!-- 댓글 내용 또는 수정 폼 -->
        <div v-if="editingCommentId !== comment.id">
          <p class="text-gray-700 whitespace-pre-wrap">{{ comment.content }}</p>
        </div>
        <div v-else>
          <textarea
              v-model="editingContent"
              class="form-textarea mb-2"
              rows="3"
          ></textarea>
          <div class="flex space-x-2">
            <button
                @click="updateComment(comment.id)"
                class="btn-primary text-sm"
            >
              저장
            </button>
            <button
                @click="cancelEdit"
                class="btn-secondary text-sm"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8 text-gray-500">
      아직 댓글이 없습니다.
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

const commentStore = useCommentStore()
const { comments, loading } = storeToRefs(commentStore)

const newComment = ref({
  author: '',
  content: ''
})

const editingCommentId = ref(null)
const editingContent = ref('')

// 댓글 목록 로드
await commentStore.fetchCommentsByPostId(props.postId)

// 댓글 작성
const submitComment = async () => {
  try {
    await commentStore.createComment({
      postId: props.postId,
      ...newComment.value
    })

    newComment.value = { author: '', content: '' }
  } catch (error) {
    alert('댓글 작성에 실패했습니다.')
  }
}

// 댓글 수정 시작
const editComment = (comment) => {
  editingCommentId.value = comment.id
  editingContent.value = comment.content
}

// 댓글 수정 저장
const updateComment = async (commentId) => {
  try {
    await commentStore.updateComment(commentId, editingContent.value)
    cancelEdit()
  } catch (error) {
    alert('댓글 수정에 실패했습니다.')
  }
}

// 댓글 수정 취소
const cancelEdit = () => {
  editingCommentId.value = null
  editingContent.value = ''
}

// 댓글 삭제
const deleteComment = async (commentId) => {
  if (confirm('정말 삭제하시겠습니까?')) {
    try {
      await commentStore.deleteComment(commentId)
    } catch (error) {
      alert('댓글 삭제에 실패했습니다.')
    }
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>