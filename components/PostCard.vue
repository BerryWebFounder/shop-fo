<template>
  <div class="card hover:shadow-lg transition-shadow" :class="cardClasses">
    <!-- 공지사항 헤더 -->
    <div v-if="post.isNotice" class="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
      <div class="flex items-center space-x-2">
        <!-- 중요 공지사항 배지 -->
        <span v-if="post.isPinned" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Icon name="warning" size="xs" class="mr-1" />
          중요 공지
        </span>

        <!-- 일반 공지사항 배지 -->
        <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Icon name="info" size="xs" class="mr-1" />
          공지사항
        </span>

        <!-- 만료 예정 경고 -->
        <span v-if="isExpiringSoon" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
          <Icon name="warning" size="xs" class="mr-1" />
          곧 만료
        </span>

        <!-- 비활성 상태 -->
        <span v-if="!post.isActive" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
          비활성
        </span>
      </div>

      <!-- 만료일 표시 -->
      <div v-if="post.expiryDate" class="text-xs text-gray-500">
        {{ formatExpiryDate(post.expiryDate) }}까지
      </div>
    </div>

    <!-- 기본 게시글 정보 -->
    <div class="flex justify-between items-start mb-3">
      <h3 class="text-xl font-semibold text-gray-900 line-clamp-2" :class="titleClasses">
        <NuxtLink
            :to="`/posts/${post.id}`"
            class="hover:text-blue-600 transition-colors"
        >
          {{ post.title }}
        </NuxtLink>
      </h3>
      <span class="text-sm text-gray-500 whitespace-nowrap ml-4">
        {{ formatDate(post.createdAt) }}
      </span>
    </div>

    <p class="text-gray-600 mb-4 line-clamp-3">
      {{ post.content }}
    </p>

    <div class="flex justify-between items-center text-sm text-gray-500">
      <div class="flex items-center space-x-4">
        <span class="flex items-center">
          <span class="mr-1">👤</span>
          {{ post.author }}
        </span>
        <span class="flex items-center" v-if="post.comments?.length">
          <span class="mr-1">💬</span>
          {{ post.comments.length }}
        </span>
        <span class="flex items-center" v-if="post.files?.length">
          <span class="mr-1">📎</span>
          {{ post.files.length }}
        </span>
        <span v-if="post.viewCount" class="flex items-center">
          <span class="mr-1">👁</span>
          {{ post.viewCount }}
        </span>
      </div>

      <div class="flex space-x-2">
        <NuxtLink
            :to="`/posts/${post.id}/edit`"
            class="text-blue-600 hover:text-blue-800 transition-colors"
        >
          수정
        </NuxtLink>
        <button
            @click="$emit('delete', post.id)"
            class="text-red-600 hover:text-red-800 transition-colors"
        >
          삭제
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete'])

// 계산된 속성들
const cardClasses = computed(() => {
  const classes = []

  if (props.post.isNotice) {
    if (props.post.isPinned) {
      classes.push('ring-2 ring-red-100 border-red-200 bg-red-50')
    } else {
      classes.push('ring-1 ring-blue-100 border-blue-200 bg-blue-50')
    }
  }

  return classes.join(' ')
})

const titleClasses = computed(() => {
  if (props.post.isNotice) {
    return props.post.isPinned ? 'text-red-900' : 'text-blue-900'
  }
  return 'text-gray-900'
})

const isExpiringSoon = computed(() => {
  if (!props.post.expiryDate || !props.post.isNotice) return false

  const expiryDate = new Date(props.post.expiryDate)
  const now = new Date()
  const threeDaysFromNow = new Date()
  threeDaysFromNow.setDate(now.getDate() + 3)

  return expiryDate <= threeDaysFromNow && expiryDate > now
})

// 날짜 포맷팅 함수들
const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return '오늘'
    } else if (diffDays === 2) {
      return '어제'
    } else if (diffDays <= 7) {
      return `${diffDays - 1}일 전`
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric'
      })
    }
  } catch (error) {
    console.error('Date formatting error:', error)
    return dateString
  }
}

const formatExpiryDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    const now = new Date()

    if (date <= now) {
      return '만료됨'
    }

    const diffTime = date - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return '내일'
    } else if (diffDays <= 7) {
      return `${diffDays}일 후`
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric'
      })
    }
  } catch (error) {
    return dateString
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>