<template>
  <div>
    <!-- 검색 바 -->
    <div class="card mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <input
              v-model="searchQuery"
              type="text"
              placeholder="제목, 내용, 작성자로 검색..."
              class="form-input"
              @keyup.enter="handleSearch"
          />
        </div>
        <div class="flex space-x-2">
          <button
              @click="handleSearch"
              class="btn-primary"
          >
            검색
          </button>
          <button
              @click="resetSearch"
              class="btn-secondary"
          >
            초기화
          </button>
        </div>
      </div>
    </div>

    <!-- 게시글 목록 -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">로딩 중...</p>
    </div>

    <div v-else-if="error" class="card text-center py-8">
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button @click="fetchPosts" class="btn-primary">다시 시도</button>
    </div>

    <div v-else>
      <div v-if="posts.length > 0" class="space-y-4 mb-8">
        <PostCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            @delete="handleDeletePost"
        />
      </div>

      <div v-else class="card text-center py-12">
        <p class="text-gray-500 mb-4">게시글이 없습니다.</p>
        <NuxtLink to="/posts/create" class="btn-primary">
          첫 게시글 작성하기
        </NuxtLink>
      </div>

      <!-- 페이지네이션 -->
      <div v-if="pagination.totalPages > 1" class="flex justify-center mt-8">
        <nav class="flex space-x-2">
          <button
              @click="goToPage(pagination.page - 1)"
              :disabled="pagination.page === 0"
              class="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>

          <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page - 1)"
              :class="[
              'px-3 py-2 border rounded-lg',
              pagination.page === page - 1
                ? 'bg-blue-600 text-white border-blue-600'
                : 'hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>

          <button
              @click="goToPage(pagination.page + 1)"
              :disabled="pagination.page >= pagination.totalPages - 1"
              class="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
const postStore = usePostStore()
const { posts, loading, error, pagination } = storeToRefs(postStore)

const searchQuery = ref('')
const currentPage = ref(0)

// 초기 데이터 로드
await postStore.fetchPosts(currentPage.value)

// 검색 처리
const handleSearch = async () => {
  if (searchQuery.value.trim()) {
    await postStore.searchPosts({ keyword: searchQuery.value.trim() }, 0)
  } else {
    await postStore.fetchPosts(0)
  }
  currentPage.value = 0
}

// 검색 초기화
const resetSearch = async () => {
  searchQuery.value = ''
  currentPage.value = 0
  await postStore.fetchPosts(0)
}

// 페이지 이동
const goToPage = async (page) => {
  currentPage.value = page
  if (searchQuery.value.trim()) {
    await postStore.searchPosts({ keyword: searchQuery.value.trim() }, page)
  } else {
    await postStore.fetchPosts(page)
  }
}

// 게시글 삭제
const handleDeletePost = async (postId) => {
  if (confirm('정말 삭제하시겠습니까?')) {
    try {
      await postStore.deletePost(postId)
      // 현재 페이지에 게시글이 없으면 이전 페이지로
      if (posts.value.length === 0 && currentPage.value > 0) {
        currentPage.value -= 1
        await goToPage(currentPage.value)
      }
    } catch (error) {
      alert('게시글 삭제에 실패했습니다.')
    }
  }
}

// 보이는 페이지 번호 계산
const visiblePages = computed(() => {
  const total = pagination.value.totalPages
  const current = pagination.value.page + 1
  const delta = 2

  const range = []
  const start = Math.max(1, current - delta)
  const end = Math.min(total, current + delta)

  for (let i = start; i <= end; i++) {
    range.push(i)
  }

  return range
})

// SEO 메타데이터
useHead({
  title: '게시판',
  meta: [
    { name: 'description', content: 'Vue3와 Nuxt3로 만든 게시판입니다.' }
  ]
})
</script>