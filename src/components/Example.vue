<template>
  <div>
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
        <details ref="columnsMenu" class="relative">
          <summary
            class="flex cursor-pointer list-none items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
          >
            ⚙️ Columns
          </summary>
          <div
            class="absolute left-0 md:left-auto md:right-0 z-40 mt-2 max-h-72 w-56 max-w-[calc(100vw-2rem)] overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
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
      </div>
    </div>

    <div
      class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-black/5"
    >
      <VirtualBiTable
        v-model:cols="visibleColumns"
        v-model:rows="rows"
        :body-height="560"
        selectable
        :sortable="true"
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
        <template
          #col-header="{ column, index, sorted, dir, sortable, toggleSort: onSort }"
        >
          <TableHeaderCell
            :column="column"
            :index="index"
            :sorted="sorted"
            :dir="dir"
            :sortable="sortable"
            :toggle-sort="onSort"
          />
        </template>

        <template #col-cell="{ column, value, row, index, rowIndex }">
          <TableBodyCell
            :column="column"
            :value="value"
            :row="row"
            :index="index"
            :row-index="rowIndex"
          />
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
import TableHeaderCell from './TableHeaderCell.vue'
import TableBodyCell from './TableBodyCell.vue'
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

const columnsMenu = ref<HTMLDetailsElement | null>(null)
onClickOutside(columnsMenu, () => {
  if (columnsMenu.value) columnsMenu.value.open = false
})
</script>
