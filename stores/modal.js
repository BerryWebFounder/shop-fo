export const useModalStore = defineStore('modal', () => {
    // State
    const isVisible = ref(false)
    const modalType = ref('info')
    const modalTitle = ref('')
    const modalMessage = ref('')
    const confirmText = ref('확인')
    const cancelText = ref('취소')

    // 현재 모달의 Promise resolver
    const currentResolver = ref(null)

    // Actions
    const showAlert = (message, type = 'info', title = '') => {
        return new Promise((resolve) => {
            modalType.value = type
            modalTitle.value = title
            modalMessage.value = message
            confirmText.value = '확인'
            isVisible.value = true
            currentResolver.value = resolve
        })
    }

    const showConfirm = (message, title = '확인', options = {}) => {
        return new Promise((resolve) => {
            modalType.value = 'confirm'
            modalTitle.value = title
            modalMessage.value = message
            confirmText.value = options.confirmText || '확인'
            cancelText.value = options.cancelText || '취소'
            isVisible.value = true
            currentResolver.value = resolve
        })
    }

    const showSuccess = (message, title = '성공') => {
        return showAlert(message, 'success', title)
    }

    const showError = (message, title = '오류') => {
        return showAlert(message, 'error', title)
    }

    const showWarning = (message, title = '경고') => {
        return showAlert(message, 'warning', title)
    }

    const hideModal = () => {
        isVisible.value = false
        currentResolver.value = null
    }

    const onConfirm = () => {
        if (currentResolver.value) {
            currentResolver.value(true)
        }
        hideModal()
    }

    const onCancel = () => {
        if (currentResolver.value) {
            currentResolver.value(false)
        }
        hideModal()
    }

    return {
        // State
        isVisible: readonly(isVisible),
        modalType: readonly(modalType),
        modalTitle: readonly(modalTitle),
        modalMessage: readonly(modalMessage),
        confirmText: readonly(confirmText),
        cancelText: readonly(cancelText),

        // Actions
        showAlert,
        showConfirm,
        showSuccess,
        showError,
        showWarning,
        hideModal,
        onConfirm,
        onCancel
    }
})