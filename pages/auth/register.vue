<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">회원가입</h2>
        <p class="mt-2 text-sm text-gray-600">
          이미 계정이 있으신가요?
          <NuxtLink to="/auth/login" class="font-medium text-blue-600 hover:text-blue-500">
            로그인
          </NuxtLink>
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- 사용자명 -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">
              사용자명 *
            </label>
            <div class="mt-1">
              <input
                  id="username"
                  v-model="form.username"
                  type="text"
                  required
                  class="form-input"
                  :class="{ 'border-red-300': validationErrors.username }"
                  placeholder="3-20자, 영문/숫자/밑줄만 사용"
                  :disabled="loading"
                  @blur="validateUsername"
              />
              <p v-if="validationErrors.username" class="mt-1 text-sm text-red-600">
                {{ validationErrors.username }}
              </p>
              <p v-else-if="usernameChecked && usernameAvailable" class="mt-1 text-sm text-green-600">
                사용 가능한 사용자명입니다.
              </p>
            </div>
          </div>

          <!-- 이메일 -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              이메일 *
            </label>
            <div class="mt-1">
              <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  class="form-input"
                  :class="{ 'border-red-300': validationErrors.email }"
                  placeholder="example@email.com"
                  :disabled="loading"
                  @blur="validateEmail"
              />
              <p v-if="validationErrors.email" class="mt-1 text-sm text-red-600">
                {{ validationErrors.email }}
              </p>
              <p v-else-if="emailChecked && emailAvailable" class="mt-1 text-sm text-green-600">
                사용 가능한 이메일입니다.
              </p>
            </div>
          </div>

          <!-- 표시 이름 -->
          <div>
            <label for="displayName" class="block text-sm font-medium text-gray-700">
              표시 이름 *
            </label>
            <div class="mt-1">
              <input
                  id="displayName"
                  v-model="form.displayName"
                  type="text"
                  required
                  class="form-input"
                  :class="{ 'border-red-300': validationErrors.displayName }"
                  placeholder="2-50자"
                  :disabled="loading"
              />
              <p v-if="validationErrors.displayName" class="mt-1 text-sm text-red-600">
                {{ validationErrors.displayName }}
              </p>
            </div>
          </div>

          <!-- 비밀번호 -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              비밀번호 *
            </label>
            <div class="mt-1 relative">
              <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  class="form-input pr-10"
                  :class="{ 'border-red-300': validationErrors.password }"
                  placeholder="8자 이상, 대소문자/숫자/특수문자 포함"
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
            <p v-if="validationErrors.password" class="mt-1 text-sm text-red-600">
              {{ validationErrors.password }}
            </p>
          </div>

          <!-- 비밀번호 확인 -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              비밀번호 확인 *
            </label>
            <div class="mt-1">
              <input
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  type="password"
                  required
                  class="form-input"
                  :class="{ 'border-red-300': validationErrors.confirmPassword }"
                  placeholder="비밀번호를 다시 입력하세요"
                  :disabled="loading"
              />
              <p v-if="validationErrors.confirmPassword" class="mt-1 text-sm text-red-600">
                {{ validationErrors.confirmPassword }}
              </p>
            </div>
          </div>

          <!-- 약관 동의 -->
          <div class="flex items-center">
            <input
                id="agreeTerms"
                v-model="form.agreeTerms"
                type="checkbox"
                required
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="agreeTerms" class="ml-2 block text-sm text-gray-700">
              <span class="text-red-500">*</span>
              <a href="#" class="text-blue-600 hover:text-blue-500">이용약관</a> 및
              <a href="#" class="text-blue-600 hover:text-blue-500">개인정보처리방침</a>에 동의합니다.
            </label>
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
                가입 중...
              </span>
              <span v-else>회원가입</span>
            </button>
          </div>
        </form>
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
const usernameChecked = ref(false)
const usernameAvailable = ref(false)
const emailChecked = ref(false)
const emailAvailable = ref(false)

// 폼 데이터
const form = ref({
  username: '',
  email: '',
  displayName: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

// 유효성 검사 에러
const validationErrors = ref({})

// 계산된 속성
const isFormValid = computed(() => {
  return form.value.username.trim() &&
      form.value.email.trim() &&
      form.value.displayName.trim() &&
      form.value.password &&
      form.value.confirmPassword &&
      form.value.agreeTerms &&
      Object.keys(validationErrors.value).length === 0 &&
      usernameAvailable.value &&
      emailAvailable.value
})

// 사용자명 검증
const validateUsername = async () => {
  const username = form.value.username.trim()

  if (!username) {
    validationErrors.value.username = '사용자명은 필수입니다.'
    usernameChecked.value = false
    return
  }

  if (username.length < 3 || username.length > 20) {
    validationErrors.value.username = '사용자명은 3-20자 사이여야 합니다.'
    usernameChecked.value = false
    return
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    validationErrors.value.username = '사용자명은 영문, 숫자, 밑줄만 사용 가능합니다.'
    usernameChecked.value = false
    return
  }

  try {
    usernameAvailable.value = await authStore.checkUsername(username)
    usernameChecked.value = true

    if (!usernameAvailable.value) {
      validationErrors.value.username = '이미 사용 중인 사용자명입니다.'
    } else {
      delete validationErrors.value.username
    }
  } catch (err) {
    validationErrors.value.username = '사용자명 확인 중 오류가 발생했습니다.'
  }
}

// 이메일 검증
const validateEmail = async () => {
  const email = form.value.email.trim()

  if (!email) {
    validationErrors.value.email = '이메일은 필수입니다.'
    emailChecked.value = false
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    validationErrors.value.email = '올바른 이메일 형식이 아닙니다.'
    emailChecked.value = false
    return
  }

  try {
    emailAvailable.value = await authStore.checkEmail(email)
    emailChecked.value = true

    if (!emailAvailable.value) {
      validationErrors.value.email = '이미 사용 중인 이메일입니다.'
    } else {
      delete validationErrors.value.email
    }
  } catch (err) {
    validationErrors.value.email = '이메일 확인 중 오류가 발생했습니다.'
  }
}

// 폼 변경 감지
watch(() => form.value.username, () => {
  usernameChecked.value = false
  usernameAvailable.value = false
  delete validationErrors.value.username
})

watch(() => form.value.email, () => {
  emailChecked.value = false
  emailAvailable.value = false
  delete validationErrors.value.email
})

watch(() => form.value.displayName, (newVal) => {
  if (newVal.length < 2 || newVal.length > 50) {
    validationErrors.value.displayName = '표시 이름은 2-50자 사이여야 합니다.'
  } else {
    delete validationErrors.value.displayName
  }
})

watch(() => form.value.password, (newVal) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/

  if (newVal.length < 8) {
    validationErrors.value.password = '비밀번호는 8자 이상이어야 합니다.'
  } else if (!passwordRegex.test(newVal)) {
    validationErrors.value.password = '대소문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다.'
  } else {
    delete validationErrors.value.password
  }

  // 비밀번호 확인도 재검증
  if (form.value.confirmPassword && newVal !== form.value.confirmPassword) {
    validationErrors.value.confirmPassword = '비밀번호가 일치하지 않습니다.'
  } else if (form.value.confirmPassword) {
    delete validationErrors.value.confirmPassword
  }
})

watch(() => form.value.confirmPassword, (newVal) => {
  if (newVal && newVal !== form.value.password) {
    validationErrors.value.confirmPassword = '비밀번호가 일치하지 않습니다.'
  } else {
    delete validationErrors.value.confirmPassword
  }
})

// 회원가입 처리
const handleRegister = async () => {
  if (!isFormValid.value || loading.value) return

  loading.value = true
  error.value = ''

  try {
    await authStore.register({
      username: form.value.username.trim(),
      email: form.value.email.trim(),
      displayName: form.value.displayName.trim(),
      password: form.value.password
    })

    await modalStore.showSuccess('회원가입이 완료되었습니다! 이메일 인증을 확인해주세요.')
    await router.push('/auth/login')

  } catch (err) {
    console.error('회원가입 실패:', err)
    error.value = err.message || '회원가입에 실패했습니다.'
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
  title: '회원가입',
  meta: [
    { name: 'description', content: '게시판에 가입하세요.' }
  ]
})
</script>