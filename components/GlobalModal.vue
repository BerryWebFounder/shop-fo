<template>
  <Modal
      :show="modalStore.isVisible"
      :type="modalStore.modalType"
      :title="modalStore.modalTitle"
      :message="modalStore.modalMessage"
      :confirm-text="modalStore.confirmText"
      :cancel-text="modalStore.cancelText"
      @confirm="modalStore.onConfirm"
      @cancel="modalStore.onCancel"
      @close="modalStore.hideModal"
  />
</template>

<script setup>
const modalStore = useModalStore()
</script>