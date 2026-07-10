<template>
  <button
    v-if="column.key === 'status'"
    type="button"
    class="flex grow items-center gap-1.5 text-left text-xs font-semibold uppercase tracking-wider text-indigo-600 select-none hover:text-indigo-700"
    @click="toggleSort"
  >
    <span>⚑</span>
    <span class="truncate">{{ column.label }}</span>
    <span v-if="sorted">{{ dir === 'asc' ? '↑' : '↓' }}</span>
  </button>

  <button
    v-else-if="column.key === 'priority'"
    type="button"
    class="flex grow items-center gap-1.5 text-left text-xs font-semibold uppercase tracking-wider text-rose-600 select-none hover:text-rose-700"
    @click="toggleSort"
  >
    <span>▲</span>
    <span class="truncate">{{ column.label }}</span>
    <span v-if="sorted">{{ dir === 'asc' ? '↑' : '↓' }}</span>
  </button>

  <button
    v-else
    type="button"
    class="flex grow items-center gap-1 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 select-none hover:text-slate-700"
    @click="toggleSort"
  >
    <span class="truncate">{{ column.label }}</span>
    <span v-if="sorted" class="text-indigo-500">
      {{ dir === 'asc' ? '↑' : '↓' }}
    </span>
  </button>
</template>

<script setup lang="ts">
import type { Col } from '../types/col.interface'

defineProps<{
  column: Col
  index?: number
  sorted?: boolean
  dir?: 'asc' | 'desc'
  sortable?: boolean
  toggleSort: () => void
}>()
</script>
