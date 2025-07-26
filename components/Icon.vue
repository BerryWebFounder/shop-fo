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
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
  >
    <!-- 아이콘 경로들... -->
    <!-- (기존 path 요소들 유지) -->
  </svg>
</template>

<script setup>
// Props 정의 수정
const props = defineProps({
  name: {
    type: String,
    required: true,
    validator: (value) => [
      'user', 'message', 'attachment', 'calendar', 'eye', 'heart',
      'search', 'plus', 'edit', 'delete', 'trash', 'arrow-left',
      'arrow-right', 'download', 'upload', 'file', 'close', 'x',
      'check'
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

// colorClass 계산 속성 수정
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