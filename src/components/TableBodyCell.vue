<template>
  <span
    v-if="column.key === 'status'"
    class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
    :class="statusClass(value)"
  >
    {{ value }}
  </span>

  <span
    v-else-if="column.key === 'priority'"
    class="inline-flex items-center gap-1.5 text-sm text-slate-600"
  >
    <span class="h-2 w-2 rounded-full" :class="priorityDot(value)"></span>
    {{ value }}
  </span>

  <span v-else class="truncate text-slate-600">{{ value }}</span>
</template>

<script setup lang="ts">
import type { Col } from '../types/col.interface'

defineProps<{
  column: Col
  value: any
  row?: any
  index?: number
  rowIndex?: number
}>()

function statusClass(value: string) {
  switch (value) {
    case 'Done':
      return 'bg-emerald-100 text-emerald-700'
    case 'In progress':
      return 'bg-amber-100 text-amber-700'
    case 'In review':
      return 'bg-sky-100 text-sky-700'
    default: // "To do"
      return 'bg-slate-100 text-slate-600'
  }
}

function priorityDot(value: string) {
  switch (value) {
    case 'Urgent':
      return 'bg-rose-500'
    case 'High':
      return 'bg-amber-500'
    case 'Medium':
      return 'bg-sky-500'
    default: // "Low"
      return 'bg-slate-400'
  }
}
</script>
