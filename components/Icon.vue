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
    <!-- User Icon -->
    <path
        v-if="name === 'user'"
        fill-rule="evenodd"
        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
        clip-rule="evenodd"
    />

    <!-- Message/Comment Icon -->
    <path
        v-else-if="name === 'message'"
        fill-rule="evenodd"
        d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
        clip-rule="evenodd"
    />

    <!-- Attachment/Paperclip Icon -->
    <path
        v-else-if="name === 'attachment'"
        fill-rule="evenodd"
        d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
        clip-rule="evenodd"
    />

    <!-- Calendar/Clock Icon -->
    <path
        v-else-if="name === 'calendar'"
        fill-rule="evenodd"
        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
        clip-rule="evenodd"
    />

    <!-- Eye Icon -->
    <path
        v-else-if="name === 'eye'"
        d="M10 12a2 2 0 100-4 2 2 0 000 4z"
    />
    <path
        v-else-if="name === 'eye'"
        fill-rule="evenodd"
        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
        clip-rule="evenodd"
    />

    <!-- Heart Icon -->
    <path
        v-else-if="name === 'heart'"
        fill-rule="evenodd"
        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
        clip-rule="evenodd"
    />

    <!-- Search Icon -->
    <path
        v-else-if="name === 'search'"
        fill-rule="evenodd"
        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
        clip-rule="evenodd"
    />

    <!-- Plus Icon -->
    <path
        v-else-if="name === 'plus'"
        fill-rule="evenodd"
        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
        clip-rule="evenodd"
    />

    <!-- Edit/Pencil Icon -->
    <path
        v-else-if="name === 'edit'"
        d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
    />

    <!-- Delete/Trash Icon -->
    <path
        v-else-if="name === 'delete' || name === 'trash'"
        fill-rule="evenodd"
        d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"
        clip-rule="evenodd"
    />
    <path
        v-else-if="name === 'delete' || name === 'trash'"
        fill-rule="evenodd"
        d="M4 5a1 1 0 011-1h10a1 1 0 110 2H6v9a2 2 0 002 2h4a2 2 0 002-2V6h1a1 1 0 110-2H5a1 1 0 01-1 1zM8 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
        clip-rule="evenodd"
    />

    <!-- Arrow Left Icon -->
    <path
        v-else-if="name === 'arrow-left'"
        fill-rule="evenodd"
        d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
        clip-rule="evenodd"
    />

    <!-- Arrow Right Icon -->
    <path
        v-else-if="name === 'arrow-right'"
        fill-rule="evenodd"
        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
        clip-rule="evenodd"
    />

    <!-- Download Icon -->
    <path
        v-else-if="name === 'download'"
        fill-rule="evenodd"
        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
        clip-rule="evenodd"
    />

    <!-- Upload Icon -->
    <path
        v-else-if="name === 'upload'"
        fill-rule="evenodd"
        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
        clip-rule="evenodd"
    />

    <!-- File Icon -->
    <path
        v-else-if="name === 'file'"
        fill-rule="evenodd"
        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
        clip-rule="evenodd"
    />

    <!-- Close/X Icon -->
    <path
        v-else-if="name === 'close' || name === 'x'"
        fill-rule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clip-rule="evenodd"
    />

    <!-- Check Icon -->
    <path
        v-else-if="name === 'check'"
        fill-rule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clip-rule="evenodd"
    />

    <!-- Default/Unknown Icon (question mark) -->
    <path
        v-else
        fill-rule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
        clip-rule="evenodd"
    />
  </svg>
</template>

<script setup>
defineProps({
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

const colorClass = computed(() => {
  const { color } = defineProps()

  if (color === 'current') return 'text-current'

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

  return colorMap[color] || 'text-current'
})
</script>