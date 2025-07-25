<template>
  <div class="card hover:shadow-lg transition-shadow">
    <div class="flex justify-between items-start mb-3">
      <h3 class="text-xl font-semibold text-gray-900 line-clamp-2">
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

const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Date formatting error:', error)
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