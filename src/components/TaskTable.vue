<template>
  <div>
    <!-- Toolbar -->
    <div class="mb-3 flex flex-wrap items-center gap-3">
      <div class="relative grow sm:max-w-xs">
        <span
          class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        >
          🔍
        </span>
        <input
          v-model="search"
          type="text"
          placeholder="Search all columns…"
          class="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div class="flex items-center gap-2">
        <span v-if="selected.size" class="text-sm text-slate-500">
          {{ selected.size }} selected
        </span>
        <button
          v-if="selected.size"
          class="rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200"
          @click="clearSelection"
        >
          Clear
        </button>
      </div>

      <div class="mx-auto md:ml-auto md:mr-0 w-full md:w-auto flex items-center gap-2">
        <!-- Column show/hide -->
        <details ref="columnsMenu" class="relative">
          <summary
            class="flex cursor-pointer list-none items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
          >
            ⚙️ Columns
          </summary>
          <div
            class="absolute right-0 z-40 mt-2 max-h-72 w-56 overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
          >
            <label
              v-for="f in fields"
              :key="f._id"
              class="flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-slate-300 accent-indigo-600"
                :checked="!isHidden(f._id)"
                :disabled="f.sticky"
                @change="toggleColumn(f._id)"
              />
              {{ f.label }}
            </label>
          </div>
        </details>

        <button
          class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
          @click="reload"
        >
          ↻ Reload
        </button>
      </div>
    </div>

    <div
      class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-black/5"
    >
      <VirtualBiTable
        v-model:cols="visibleColumns"
        v-model:rows="rows"
        :body-height="560"
        :loading="loading"
        selectable
        :item-draggable="isSourceOrder"
        :sort-key="sortKey"
        :sort-dir="sortDir"
        :selected-ids="selected"
        :all-selected="allSelected"
        :some-selected="someSelected"
        @sort="toggleSort"
        @toggle-row="toggleRow"
        @toggle-all="toggleAll"
      >
        <!-- Custom header for the Status column (slot name = column `key`). -->
        <template #col-header-status="{ column, sorted, dir, toggleSort: sort }">
          <button
            type="button"
            class="flex grow items-center gap-1.5 text-left text-xs font-semibold uppercase tracking-wider text-indigo-600 select-none hover:text-indigo-700"
            @click="sort"
          >
            <span>⚑</span>
            <span class="truncate">{{ column.label }}</span>
            <span v-if="sorted">{{ dir === 'asc' ? '↑' : '↓' }}</span>
          </button>
        </template>

        <!-- Custom body cell for the Status column. -->
        <template #col-cell-status="{ value }">
          <span
            class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            :class="statusClass(value)"
          >
            {{ value }}
          </span>
        </template>
      </VirtualBiTable>
    </div>

    <p class="mt-3 text-center text-xs text-slate-400">
      Drag a column header to reorder · hover a column edge to resize · click a
      header to sort · drag a row to move it (when unsorted &amp; unfiltered)
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import VirtualBiTable from './VirtualBiTable.vue'
import { useMockData } from '../composables/useMockData.ts'
import { useTable } from '../composables/useTable.ts'

const { fields, tasks, generate } = useMockData(1000)
generate()

const {
  search,
  sortKey,
  sortDir,
  toggleSort,
  visibleColumns,
  isHidden,
  toggleColumn,
  rows,
  isSourceOrder,
  selected,
  toggleRow,
  allSelected,
  someSelected,
  toggleAll,
  clearSelection,
} = useTable(fields, tasks)

const loading = ref(false)

// Maps a Status value to pill colors — used by the #col-cell-status example slot.
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

// Close the columns dropdown when clicking outside of it.
const columnsMenu = ref<HTMLDetailsElement | null>(null)
onClickOutside(columnsMenu, () => {
  if (columnsMenu.value) columnsMenu.value.open = false
})

function reload() {
  loading.value = true
  clearSelection()
  setTimeout(() => {
    generate(1000)
    loading.value = false
  }, 800)
}
</script>
