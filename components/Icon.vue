<template>
  <svg
      :class="[
        'inline-block',
        sizeClasses[size],
        colorClass
      ]"
      :fill="fill"
      :stroke="stroke"
      :stroke-width="strokeWidth"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
  >
    <!-- User 아이콘 -->
    <path v-if="name === 'user'" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>

    <!-- Calendar 아이콘 -->
    <path v-else-if="name === 'calendar'" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>

    <!-- Message/Comment 아이콘 -->
    <path v-else-if="name === 'message'" d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>

    <!-- Attachment/Paperclip 아이콘 -->
    <path v-else-if="name === 'attachment'" d="M7.5 18A5.5 5.5 0 0 1 2 12.5V7A6 6 0 0 1 8 1v0a6 6 0 0 1 6 6v7.5a4 4 0 0 1-4 4v0a4 4 0 0 1-4-4V7a2.5 2.5 0 0 1 2.5-2.5v0A2.5 2.5 0 0 1 11 7v6.5"/>

    <!-- Eye 아이콘 -->
    <path v-else-if="name === 'eye'" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>

    <!-- Heart 아이콘 -->
    <path v-else-if="name === 'heart'" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>

    <!-- Search 아이콘 -->
    <path v-else-if="name === 'search'" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>

    <!-- Plus/Add 아이콘 -->
    <path v-else-if="name === 'plus'" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>

    <!-- Edit/Pencil 아이콘 -->
    <path v-else-if="name === 'edit'" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>

    <!-- Delete/Trash 아이콘 -->
    <path v-else-if="name === 'delete' || name === 'trash'" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>

    <!-- Arrow Left 아이콘 -->
    <path v-else-if="name === 'arrow-left'" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>

    <!-- Arrow Right 아이콘 -->
    <path v-else-if="name === 'arrow-right'" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>

    <!-- Download 아이콘 -->
    <path v-else-if="name === 'download'" d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z"/>

    <!-- Upload 아이콘 -->
    <path v-else-if="name === 'upload'" d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>

    <!-- File 아이콘 -->
    <path v-else-if="name === 'file'" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>

    <!-- Close/X 아이콘 -->
    <path v-else-if="name === 'close' || name === 'x'" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>

    <!-- Check 아이콘 -->
    <path v-else-if="name === 'check'" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>

    <!-- Info 아이콘 -->
    <path v-else-if="name === 'info'" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>

    <!-- Warning 아이콘 -->
    <path v-else-if="name === 'warning'" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>

    <!-- Image 아이콘 -->
    <path v-else-if="name === 'image'" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>

    <!-- Video 아이콘 -->
    <path v-else-if="name === 'video'" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>

    <!-- Music/Audio 아이콘 -->
    <path v-else-if="name === 'music' || name === 'audio'" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>

    <!-- Archive/Zip 아이콘 -->
    <path v-else-if="name === 'archive'" d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>

    <!-- Document 아이콘 -->
    <path v-else-if="name === 'document'" d="M8 16h8v2H8zm0-4h8v2H8zm6-10H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>

    <!-- 기본 아이콘 (알 수 없는 아이콘명일 때) -->
    <circle v-else cx="12" cy="12" r="10"/>
  </svg>
</template>

<script setup>
// Props 정의
const props = defineProps({
  name: {
    type: String,
    required: true,
    validator: (value) => [
      'user', 'message', 'attachment', 'calendar', 'eye', 'heart',
      'search', 'plus', 'edit', 'delete', 'trash', 'arrow-left',
      'arrow-right', 'download', 'upload', 'file', 'close', 'x',
      'check', 'info', 'warning', 'image', 'video', 'music', 'audio',
      'archive', 'document'
    ].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  color: {
    type: String,
    default: 'current'
  },
  fill: {
    type: String,
    default: 'currentColor'
  },
  stroke: {
    type: String,
    default: 'none'
  },
  strokeWidth: {
    type: [String, Number],
    default: 0
  }
})

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
}

// colorClass 계산 속성
const colorClass = computed(() => {
  if (props.color === 'current') return 'text-current'

  const colorMap = {
    gray: 'text-gray-500',
    blue: 'text-blue-500',
    green: 'text-green-500',
    red: 'text-red-500',
    yellow: 'text-yellow-500',
    purple: 'text-purple-500',
    indigo: 'text-indigo-500',
    pink: 'text-pink-500'
  }

  return colorMap[props.color] || 'text-current'
})
</script>