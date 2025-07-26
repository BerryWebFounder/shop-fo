<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-2xl font-bold text-blue-600">
              게시판
            </NuxtLink>
          </div>
          <nav class="flex space-x-4">
            <NuxtLink
                to="/"
                class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md transition-colors"
                :class="{ 'text-blue-600 font-semibold': $route.path === '/' }"
            >
              홈
            </NuxtLink>
            <NuxtLink
                to="/posts/create"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                @click="handleCreateClick"
            >
              글쓰기
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p class="text-center text-gray-500">
          © 2025 Simple Board. Made with Claude
        </p>
      </div>
    </footer>

    <!-- Global Modal -->
    <GlobalModal />
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

// 글쓰기 버튼 클릭 핸들러 (디버깅용)
const handleCreateClick = async (event) => {
  console.log('Create button clicked')
  console.log('Current route:', route.path)
  console.log('Target route: /posts/create')

  try {
    // 기본 동작 방지하고 수동으로 네비게이션
    event.preventDefault()

    console.log('Navigating to /posts/create...')
    await router.push('/posts/create')
    console.log('Navigation completed')

  } catch (error) {
    console.error('Navigation error:', error)
  }
}

// 라우트 변경 감지 (디버깅)
watch(() => route.path, (newPath, oldPath) => {
  console.log('Route changed:', { from: oldPath, to: newPath })
})
</script>