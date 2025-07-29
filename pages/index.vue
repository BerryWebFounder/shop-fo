<template>
  <div>
    <!-- 공지사항/게시글 전환 탭 -->
    <div class="mb-6">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
              @click="setViewMode('all')"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                viewMode === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
          >
            전체 (공지사항 + 게시글)
          </button>
          <button
              @click="setViewMode('notices')"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                viewMode === 'notices'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
          >
            공지사항만 ({{ noticeCount }}개)
          </button>
          <button
              @click="setViewMode('posts')"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                viewMode === 'posts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
          >
            일반 게시글만 ({{ regularPostCount }}개)
          </button>
        </nav>
      </div>
    </div>

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

      <!-- 검색 결과 요약 -->
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
      <button @click="fetchData" class="btn-primary">다시 시도</button>
    </div>

    <div v-else>
      <!-- 중요 공지사항 (항상 최상단) -->
      <div v-if="pinnedNotices.length > 0 && (viewMode === 'all' || viewMode === 'notices')" class="mb-6">
        <div class="flex items-center mb-4">
          <div class="flex items-center space-x-2">
            <Icon name="warning" size="sm" color="red" />
            <h2 class="text-lg font-semibold text-red-800">중요 공지사항</h2>
          </div>
        </div>
        <div class="space-y-3">
          <PostCard
              v-for="notice in pinnedNotices"
              :key="`pinned-${notice.id}`"
              :post="notice"
              @delete="handleDeletePost"
          />
        </div>
      </div>

      <!-- 일반 공지사항 -->
      <div v-if="regularNotices.length > 0 && (viewMode === 'all' || viewMode === 'notices')" class="mb-6">
        <div class="flex items-center mb-4">
          <div class="flex items-center space-x-2">
            <Icon name="info" size="sm" color="blue" />
            <h2 class="text-lg font-semibold text-blue-800">공지사항</h2>
          </div>
        </div>
        <div class="space-y-3">
          <PostCard
              v-for="notice in regularNotices"
              :key="`notice-${notice.id}`"
              :post="notice"
              @delete="handleDeletePost"
          />
        </div>
      </div>

      <!-- 일반 게시글 -->
      <div v-if="displayedPosts.length > 0">
        <div v-if="viewMode === 'all' && (pinnedNotices.length > 0 || regularNotices.length > 0)" class="flex items-center mb-4">
          <div class="flex items-center space-x-2">
            <Icon name="file" size="sm" color="gray" />
            <h2 class="text-lg font-semibold text-gray-700">일반 게시글</h2>
          </div>
        </div>

        <div class="space-y-4 mb-8">
          <PostCard
              v-for="post in displayedPosts"
              :key="`post-${post.id}`"
              :post="post"
              @delete="handleDeletePost"
          />
        </div>
      </div>

      <!-- 빈 상태 -->
      <div v-if="allDisplayedPosts.length === 0" class="card text-center py-12">
        <div v-if="isSearching">
          <Icon name="search" size="xl" color="gray" class="mx-auto mb-4" />
          <p class="text-gray-500 mb-4">검색 결과가 없습니다.</p>
          <button @click="resetSearch" class="btn-secondary mb-2">전체 목록 보기</button>
        </div>
        <div v-else>
          <Icon name="file" size="xl" color="gray" class="mx-auto mb-4" />
          <p class="text-gray-500 mb-4">
            {{ getEmptyMessage() }}
          </p>
          <NuxtLink to="/posts/create" class="btn-primary">
            {{ getCreateButtonText() }}
          </NuxtLink>
        </div>
      </div>

      <!-- 페이지네이션 -->
      <div v-if="pagination.totalPages > 1" class="flex justify-center mt-8">
        <nav class="flex space-x-2">
          <button
              @click="goToPage(pagination.page - 1)"
              :disabled="pagination.page === 0"
              class="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            이전
          </button>

          <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page - 1)"
              :class="[
              'px-3 py-2 border rounded-lg transition-colors',
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
              class="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
const { currentPosts, loading, error, pagination, pinnedNotices, regularNotices, noticePosts, regularPosts } = storeToRefs(postStore)

// 상태 관리
const searchQuery = ref('')
const searchType = ref('all')
const currentPage = ref(0)
const isSearching = ref(false)
const currentSearchInfo = ref('')
const viewMode = ref('all') // 'all', 'notices', 'posts'

// 초기 데이터 로드 (공지사항 포함)
await postStore.fetchAllPosts(currentPage.value)

// 계산된 속성들
const displayedPosts = computed(() => {
  switch (viewMode.value) {
    case 'notices':
      return []
    case 'posts':
      return regularPosts.value
    case 'all':
    default:
      return regularPosts.value
  }
})

const allDisplayedPosts = computed(() => {
  const posts = []

  if (viewMode.value === 'all' || viewMode.value === 'notices') {
    posts.push(...pinnedNotices.value, ...regularNotices.value)
  }

  if (viewMode.value === 'all' || viewMode.value === 'posts') {
    posts.push(...displayedPosts.value)
  }

  return posts
})

const noticeCount = computed(() => noticePosts.value.length)
const regularPostCount = computed(() => regularPosts.value.length)

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

// 메서드들
const getSearchPlaceholder = () => {
  const placeholders = {
    all: '제목, 내용, 작성자로 검색...',
    title: '게시글 제목 검색...',
    content: '내용 키워드 검색...',
    author: '작성자명 검색...'
  }
  return placeholders[searchType.value]
}

const getEmptyMessage = () => {
  switch (viewMode.value) {
    case 'notices':
      return '공지사항이 없습니다.'
    case 'posts':
      return '일반 게시글이 없습니다.'
    case 'all':
    default:
      return '게시글이 없습니다.'
  }
}

const getCreateButtonText = () => {
  switch (viewMode.value) {
    case 'notices':
      return '첫 공지사항 작성하기'
    case 'posts':
      return '첫 게시글 작성하기'
    case 'all':
    default:
      return '첫 게시글 작성하기'
  }
}

const setViewMode = async (mode) => {
  console.log('View mode changed:', viewMode.value, '→', mode)
  viewMode.value = mode

  // 검색 중이 아닐 때만 데이터 새로고침
  if (!isSearching.value) {
    await fetchData()
  }
}

const fetchData = async () => {
  currentPage.value = 0

  // 항상 전체 데이터를 가져온 후 뷰모드에 따라 필터링
  await postStore.fetchAllPosts(currentPage.value)
}

const handleSearch = async () => {
  const query = searchQuery.value.trim()

  if (!query) {
    await resetSearch()
    return
  }

  try {
    const searchParams = {}

    if (searchType.value === 'all') {
      searchParams.keyword = query
    } else {
      searchParams[searchType.value] = query
    }

    console.log('Search params:', searchParams)

    await postStore.searchPosts(searchParams, 0)
    currentPage.value = 0
    isSearching.value = true

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

const resetSearch = async () => {
  searchQuery.value = ''
  searchType.value = 'all'
  currentPage.value = 0
  isSearching.value = false
  currentSearchInfo.value = ''
  await postStore.fetchAllPosts(0)
}

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
    await postStore.fetchAllPosts(page)
  }
}

const handleDeletePost = async (postId) => {
  if (await modalStore.showConfirm('정말 삭제하시겠습니까?')) {
    try {
      await postStore.deletePost(postId)

      // 현재 페이지에 게시글이 없으면 이전 페이지로
      if (allDisplayedPosts.value.length === 0 && currentPage.value > 0) {
        currentPage.value -= 1
        await goToPage(currentPage.value)
      }
    } catch (error) {
      await modalStore.showError('게시글 삭제에 실패했습니다.')
    }
  }
}

// SEO 메타데이터
useHead({
  title: '게시판',
  meta: [
    { name: 'description', content: '공지사항과 게시글을 확인할 수 있는 게시판입니다.' }
  ]
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

input:focus,
select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.border-b-2 {
  border-bottom-width: 2px;
}

@media (max-width: 768px) {
  .space-x-8 {
    gap: 1rem;
  }

  .px-6 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>