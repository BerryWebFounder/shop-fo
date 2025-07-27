<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
              게시판
            </NuxtLink>
          </div>
          <nav class="flex space-x-4">
            <NuxtLink
                to="/"
                class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md transition-colors flex items-center"
                :class="{ 'text-blue-600 font-semibold bg-blue-50': $route.path === '/' }"
            >
              <Icon name="user" size="sm" class="mr-1" />
              홈
            </NuxtLink>
            <NuxtLink
                to="/posts/create"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                :class="{ 'ring-2 ring-blue-300': $route.path === '/posts/create' }"
            >
              <Icon name="plus" size="sm" class="mr-1" />
              글쓰기
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 에러 경계 -->
      <div v-if="error" class="card mb-6 border-red-200 bg-red-50">
        <div class="flex items-center text-red-800">
          <Icon name="warning" size="sm" class="mr-2" />
          <div>
            <h3 class="font-medium">페이지 로드 중 오류가 발생했습니다</h3>
            <p class="text-sm mt-1">{{ error.message || error }}</p>
            <button
                @click="clearError"
                class="mt-2 text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
            >
              오류 닫기
            </button>
          </div>
        </div>
      </div>

      <!-- 네트워크 상태 표시 -->
      <div v-if="!online" class="card mb-6 border-yellow-200 bg-yellow-50">
        <div class="flex items-center text-yellow-800">
          <Icon name="warning" size="sm" class="mr-2" />
          <span class="text-sm">인터넷 연결을 확인해주세요.</span>
        </div>
      </div>

      <!-- 페이지 로딩 상태 -->
      <div v-if="pending" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-sm text-gray-600">페이지를 로딩하고 있습니다...</p>
      </div>

      <!-- 실제 페이지 컨텐츠 -->
      <slot v-else />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
          <p class="text-gray-500 text-sm">
            © 2025 Simple Board. Vue 3 + Nuxt 3 + Tailwind CSS
          </p>
          <div class="mt-2 flex justify-center items-center space-x-4 text-xs text-gray-400">
            <span>API: {{ apiStatus }}</span>
            <span>•</span>
            <span>Version: 1.0.0</span>
          </div>
        </div>
      </div>
    </footer>

    <!-- Global Modal -->
    <GlobalModal />
  </div>
</template>

<script setup>
const route = useRoute()
const config = useRuntimeConfig()

// 상태 관리
const error = ref(null)
const pending = ref(false)
const online = ref(true)
const apiStatus = ref('연결 확인 중...')

// API 상태 확인
const checkApiStatus = async () => {
  try {
    const api = useApi()
    await api.utils.ping()
    apiStatus.value = '연결됨'
  } catch (err) {
    console.warn('API connection failed:', err)
    apiStatus.value = '연결 실패'
  }
}

// 에러 처리
const clearError = () => {
  error.value = null
}

// 네트워크 상태 감지
onMounted(() => {
  // 온라인 상태 감지
  online.value = navigator.onLine

  const handleOnline = () => {
    online.value = true
    checkApiStatus()
  }

  const handleOffline = () => {
    online.value = false
    apiStatus.value = '오프라인'
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // 초기 API 상태 확인
  checkApiStatus()

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })
})

// 라우트 변경 감지
watch(() => route.path, (newPath, oldPath) => {
  console.log('Route changed:', { from: oldPath, to: newPath })

  // 라우트 변경 시 에러 초기화
  clearError()
})

// 글로벌 에러 핸들러
onErrorCaptured((err, instance, info) => {
  console.error('Global error captured:', { err, instance, info })
  error.value = err
  return false // 에러 전파 중단
})

// 앱 수준 에러 처리
if (process.client) {
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    error.value = event.error
  })

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    error.value = new Error('처리되지 않은 오류가 발생했습니다.')
  })
}
</script>

<style scoped>
/* 추가 스타일링 */
.card {
  @apply bg-white rounded-lg shadow-md p-6;
}

/* 네비게이션 활성 상태 스타일 */
.router-link-active {
  @apply text-blue-600 font-semibold;
}

/* 로딩 애니메이션 개선 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 반응형 네비게이션 */
@media (max-width: 640px) {
  nav {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }

  nav a {
    text-align: center;
    padding: 0.75rem 1rem;
  }
}
</style>