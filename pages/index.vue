<template>
  <div>
    <!-- 개선된 검색 바 -->
    <div class="card mb-6">
      <div class="space-y-4">
        <!-- 검색 필드 선택 -->
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="sm:w-1/4">
            <select v-model="searchType" class="form-input">
              <option value="all">전체</option>
              <option value="title">제목</option>
              <option value="content">내용</option>
              <option value="author">작성자</option>
            </select>
          </div>
          <div class="flex-1">
            <input
                v-model="searchQuery"
                type="text"
                :placeholder="getSearchPlaceholder()"
                class="form-input"
                @keyup.enter="handleSearch"
            />
          </div>
          <div class="flex space-x-2">
            <button
                @click="handleSearch"
                class="btn-primary"
                :disabled="loading"
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

        <!-- 현재 검색 조건 표시 -->
        <div v-if="currentSearchInfo" class="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <span class="font-medium">검색 결과:</span>
          {{ currentSearchInfo }}
          <span class="ml-2 text-blue-600">({{ pagination.totalElements }}개)</span>
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
        <div v-if="isSearching">
          <p class="text-gray-500 mb-4">검색 결과가 없습니다.</p>
          <button @click="resetSearch" class="btn-secondary mb-2">전체 목록 보기</button>
        </div>
        <div v-else>
          <p class="text-gray-500 mb-4">게시글이 없습니다.</p>
          <NuxtLink to="/posts/create" class="btn-primary">
            첫 게시글 작성하기
          </NuxtLink>
        </div>
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
const modalStore = useModalStore()
const postStore = usePostStore()
const { posts, loading, error, pagination } = storeToRefs(postStore)

// 검색 관련 상태
const searchQuery = ref('')
const searchType = ref('all')
const currentPage = ref(0)
const isSearching = ref(false)
const currentSearchInfo = ref('')

// 초기 데이터 로드
await postStore.fetchPosts(currentPage.value)

// 검색 placeholder 동적 변경
const getSearchPlaceholder = () => {
  const placeholders = {
    all: '제목, 내용, 작성자로 검색...',
    title: '제목으로 검색...',
    content: '내용으로 검색...',
    author: '작성자명으로 검색...'
  }
  return placeholders[searchType.value]
}

// 개선된 검색 처리
const handleSearch = async () => {
  const query = searchQuery.value.trim()

  if (!query) {
    await resetSearch()
    return
  }

  try {
    // 검색 파라미터 구성
    const searchParams = {}

    if (searchType.value === 'all') {
      // 전체 검색 - 기존 방식 유지
      searchParams.keyword = query
    } else {
      // 특정 필드 검색
      searchParams[searchType.value] = query
    }

    console.log('Search params:', searchParams)

    await postStore.searchPosts(searchParams, 0)
    currentPage.value = 0
    isSearching.value = true

    // 검색 정보 업데이트
    const typeNames = {
      all: '전체',
      title: '제목',
      content: '내용',
      author: '작성자'
    }
    currentSearchInfo.value = `${typeNames[searchType.value]}에서 "${query}" 검색`

  } catch (error) {
    console.error('Search error:', error)
    await modalStore.showError('검색 중 오류가 발생했습니다.')
  }
}

// 검색 초기화
const resetSearch = async () => {
  searchQuery.value = ''
  searchType.value = 'all'
  currentPage.value = 0
  isSearching.value = false
  currentSearchInfo.value = ''
  await postStore.fetchPosts(0)
}

// 페이지 이동
const goToPage = async (page) => {
  currentPage.value = page

  if (isSearching.value && searchQuery.value.trim()) {
    const searchParams = {}
    if (searchType.value === 'all') {
      searchParams.keyword = searchQuery.value.trim()
    } else {
      searchParams[searchType.value] = searchQuery.value.trim()
    }
    await postStore.searchPosts(searchParams, page)
  } else {
    await postStore.fetchPosts(page)
  }
}

// 게시글 삭제
const handleDeletePost = async (postId) => {
  if (await modalStore.showConfirm('정말 삭제하시겠습니까?')) {
    try {
      await postStore.deletePost(postId)
      // 현재 페이지에 게시글이 없으면 이전 페이지로
      if (posts.value.length === 0 && currentPage.value > 0) {
        currentPage.value -= 1
        await goToPage(currentPage.value)
      }
    } catch (error) {
      await modalStore.showError('게시글 삭제에 실패했습니다.')
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