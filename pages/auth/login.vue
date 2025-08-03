<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">로그인</h2>
        <p class="mt-2 text-sm text-gray-600">
          계정이 없으신가요?
          <NuxtLink to="/auth/register" class="font-medium text-blue-600 hover:text-blue-500">
            회원가입
          </NuxtLink>
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- 사용자명/이메일 -->
          <div>
            <label for="usernameOrEmail" class="block text-sm font-medium text-gray-700">
              사용자명 또는 이메일
            </label>
            <div class="mt-1">
              <input
                  id="usernameOrEmail"
                  v-model="form.usernameOrEmail"
                  type="text"
                  required
                  class="form-input"
                  placeholder="사용자명 또는 이메일을 입력하세요"
                  :disabled="loading"
              />
            </div>
          </div>

          <!-- 비밀번호 -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <div class="mt-1 relative">
              <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  class="form-input pr-10"
                  placeholder="비밀번호를 입력하세요"
                  :disabled="loading"
              />
              <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <Icon :name="showPassword ? 'eye' : 'eye'" size="sm" />
              </button>
            </div>
          </div>

          <!-- 로그인 유지 -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                  id="rememberMe"
                  v-model="form.rememberMe"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="rememberMe" class="ml-2 block text-sm text-gray-700">
                로그인 상태 유지
              </label>
            </div>
            <div class="text-sm">
              <NuxtLink to="/auth/forgot-password" class="font-medium text-blue-600 hover:text-blue-500">
                비밀번호를 잊으셨나요?
              </NuxtLink>
            </div>
          </div>

          <!-- 에러 메시지 -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex">
              <Icon name="warning" size="sm" color="red" class="mr-2 mt-0.5" />
              <p class="text-sm text-red-600">{{ error }}</p>
            </div>
          </div>

          <!-- 제출 버튼 -->
          <div>
            <button
                type="submit"
                class="w-full btn-primary"
                :disabled="loading || !isFormValid"
            >
              <span v-if="loading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                로그인 중...
              </span>
              <span v-else>로그인</span>
            </button>
          </div>
        </form>

        <!-- 소셜 로그인 (향후 확장) -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              테스트 계정으로 로그인하거나
              <NuxtLink to="/auth/register" class="font-medium text-blue-600 hover:text-blue-500">
                새 계정을 만드세요
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const router = useRouter()
const authStore = useAuthStore()
const modalStore = useModalStore()

// 상태
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

// 폼 데이터
const form = ref({
  usernameOrEmail: '',
  password: '',
  rememberMe: false
})

// 계산된 속성
const isFormValid = computed(() => {
  return form.value.usernameOrEmail.trim() && form.value.password.trim()
})

// 로그인 처리
const handleLogin = async () => {
  if (!isFormValid.value || loading.value) return

  loading.value = true
  error.value = ''

  try {
    await authStore.login({
      usernameOrEmail: form.value.usernameOrEmail.trim(),
      password: form.value.password,
      rememberMe: form.value.rememberMe
    })

    await modalStore.showSuccess('로그인이 완료되었습니다!')

    // 이전 페이지로 돌아가거나 메인 페이지로 이동
    const redirect = router.currentRoute.value.query.redirect || '/'
    await router.push(redirect)

  } catch (err) {
    console.error('로그인 실패:', err)
    error.value = err.message || '로그인에 실패했습니다.'
  } finally {
    loading.value = false
  }
}

// 이미 로그인된 사용자는 메인 페이지로 리디렉션
onMounted(() => {
  if (authStore.isLoggedIn) {
    router.push('/')
  }
})

// SEO
useHead({
  title: '로그인',
  meta: [
    { name: 'description', content: '게시판에 로그인하세요.' }
  ]
})
</script>