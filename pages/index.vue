<template>
  <div>
    <!-- 깔끔한 검색 바 -->
    <div class="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div class="flex gap-2 items-center">
        <!-- 검색 타입 선택 -->
        <select v-model="searchType" class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none flex-shrink-0 w-20 sm:w-24">
          <option value="all">전체</option>
          <option value="title">제목</option>
          <option value="content">내용</option>
          <option value="author">작성자</option>
        </select>

        <!-- 검색 입력 -->
        <div class="flex-1 relative">
          <input
              v-model="searchQuery"
              type="text"
              :placeholder="getSearchPlaceholder()"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              @keyup.enter="handleSearch"
          />
          <div v-if="searchQuery" class="absolute right-3 top-2.5">
            <button @click="searchQuery = ''" class="text-gray-400 hover:text-gray-600">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 버튼 영역 -->
        <div class="flex gap-2 flex-shrink-0">
          <button
              @click="handleSearch"
              class="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm whitespace-nowrap"
              :disabled="loading"
          >
            {{ loading ? '검색 중...' : '검색' }}
          </button>
          <button
              @click="resetSearch"
              class="px-2 sm:px-3 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm whitespace-nowrap"
          >
            초기화
          </button>
        </div>
      </div>

      <!-- 검색 결과 요약 (더 컴팩트하게) -->
      <div v-if="currentSearchInfo" class="mt-3 pt-3 border-t border-gray-100">
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600">
            <span class="font-medium">{{ currentSearchInfo }}</span>
          </span>
          <span class="text-blue-600 font-medium">{{ pagination.totalElements }}개 결과</span>
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
const router = useRouter()
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

// 네비게이션 함수들
const navigateToPost = (postId) => {
  router.push(`/posts/${postId}`)
}

const navigateToEdit = (postId) => {
  router.push(`/posts/${postId}/edit`)
}

// 검색 placeholder 동적 변경
const getSearchPlaceholder = () => {
  const placeholders = {
    all: '제목, 내용, 작성자로 검색...',
    title: '게시글 제목 검색...',
    content: '내용 키워드 검색...',
    author: '작성자명 검색...'
  }
  return placeholders[searchType.value]
}

// 검색 처리
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
      searchParams.keyword = query
    } else {
      searchParams[searchType.value] = query
    }

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

// 데이터 새로고침
const fetchPosts = async () => {
  await postStore.fetchPosts(currentPage.value)
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

// 날짜 포맷팅
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
    return dateString
  }
}

// SEO 메타데이터
useHead({
  title: '게시판',
  meta: [
    { name: 'description', content: '깔끔하고 심플한 게시판입니다.' }
  ]
})
</script>

<style scoped>
/* 텍스트 라인 제한 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 포커스 스타일 */
input:focus,
select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 그룹 호버 효과 */
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

/* 카드 호버 효과 */
.bg-white:hover .opacity-0 {
  opacity: 1;
}

/* 반응형 */
@media (max-width: 1024px) {
  .lg\:flex-row {
    flex-direction: column;
  }

  .lg\:w-40 {
    width: 100%;
  }

  .space-x-3 {
    flex-direction: column;
    gap: 0.75rem;
  }

  .space-x-3 > * + * {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .max-w-6xl {
    max-width: none;
  }

  .px-6 {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .text-3xl {
    font-size: 1.875rem;
  }

  .py-8 {
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
  }

  .p-6 {
    padding: 1rem;
  }

  .space-y-4 > * + * {
    margin-top: 1rem;
  }
}

@media (max-width: 640px) {
  .flex.items-center.justify-between {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .space-x-4 > * + * {
    margin-left: 0;
    margin-top: 0.5rem;
  }

  .flex.items-center.space-x-4 {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .flex.items-center.space-x-4 > * + * {
    margin-left: 0;
  }
}
</style>