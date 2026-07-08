<template>
  <div class="w-full h-fit">
    <div :id="componentId" class="w-full h-fit">
      <!-- Header: its own horizontal scroller, kept in sync with the body -->
      <div
        ref="headerScroll"
        class="no-scrollbar w-full overflow-x-auto overflow-y-hidden"
        :class="[fixedHeader ? 'sticky top-0 z-30' : '']"
        @scroll="onHeaderScroll"
      >
        <draggable
          v-model="cols"
          :wrapper-props="headerOptions"
          class="w-fit flex flex-nowrap bg-bg-primary"
          direction="horizontal"
          tag="div"
          handle=".header-handler"
          filter=".handle"
          :prevent-on-filter="false"
          :component-data="{
            tag: 'div',
            type: 'transition-group',
            name: !headerDrag ? 'flip-list' : null,
          }"
          :item-key="(key: HeaderItem) => key['_id']"
          :move="onHeaderMove"
          @moved="tableHeaderMoved"
          @change="change"
        >
          <template #item="{ element: header, index: headerIndex }">
            <Resizable
              :id="header._id"
              v-model:width="header.width"
              :show-on-hover="false"
              :style="{
                minWidth: '100px',
                maxWidth: '600px',
                height: 'inherit',
                minHeight: 'inherit',
                maxHeight: 'inherit',
                border: 'none',
              }"
              :min-width="100"
              :max-width="600"
              :handles="['r']"
              class="h-fit relative flex items-center shrink-0 bg-slate-50 header-item"
              :class="{ 'sticky! left-0 z-10': headerIndex === 0 }"
              @resize-start="resizeStart"
            >
              <div
                class="w-full h-11 flex items-center gap-2 border-b border-slate-200 px-4"
                :class="{ 'header-handler cursor-move': headerIndex !== 0 }"
              >
                <input
                  v-if="selectable && headerIndex === 0"
                  type="checkbox"
                  class="h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-indigo-600"
                  :checked="allSelected"
                  :indeterminate.prop="someSelected"
                  @change="emit('toggleAll')"
                  @click.stop
                  @mousedown.stop
                />
                <slot
                  v-if="hasSlot('col-header-' + columnKey(header))"
                  :name="'col-header-' + columnKey(header)"
                  v-bind="headerScope(header, headerIndex)"
                />
                <slot
                  v-else-if="hasSlot('col-header')"
                  name="col-header"
                  v-bind="headerScope(header, headerIndex)"
                />
                <button
                  v-else
                  type="button"
                  class="flex grow items-center gap-1 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 select-none hover:text-slate-700"
                  @click="emit('sort', header._id)"
                >
                  <span class="truncate">{{ header.label }}</span>
                  <span v-if="sortKey === header._id" class="text-indigo-500">
                    {{ sortDir === 'asc' ? '↑' : '↓' }}
                  </span>
                </button>
              </div>
            </Resizable>
          </template>
        </draggable>
      </div>

      <!-- Body: scrolls vertically (virtual list) and horizontally (synced) -->
      <div
        v-bind="containerProps"
        :id="'table-body-' + componentId"
        class="relative w-full"
        :style="{
          maxHeight: props.bodyHeight + 'px',
          overflowY: props.bodyHeight !== Infinity ? 'auto' : 'visible',
          overflowX: 'auto',
        }"
        @scroll="onBodyScroll"
      >
        <!-- Skeleton while loading -->
        <div v-if="loading" :style="{ width: tableBodyWidth + 'px' }">
          <div
            v-for="n in 12"
            :key="n"
            class="flex h-11 items-center border-b border-slate-100"
          >
            <div
              v-for="(h, i) in cols"
              :key="h._id"
              class="shrink-0 px-4"
              :style="{
                width: h.width + 'px',
                minWidth: '100px',
                maxWidth: '600px',
              }"
            >
              <div
                class="h-3 animate-pulse rounded bg-slate-200"
                :style="{ width: i === 0 ? '70%' : '50%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Data -->
        <div
          v-else
          v-bind="wrapperProps"
          :style="{ width: tableBodyWidth + 'px', minWidth: '100px' }"
        >
          <draggable
            :list="draggableRows"
            class="flex flex-wrap min-w-full w-fit h-fit"
            direction="vertical"
            handle=".body-handle"
            tag="div"
            :group="{ name: 'items', pull: true, put: true }"
            :sort="itemDraggable"
            :move="checkCanMoveItem"
            :component-data="{
              attrs: { data_category_id: column },
              tag: 'div',
              type: 'transition-group',
              name: !itemDraggable ? 'flip-list' : null,
            }"
            :item-key="(item: any) => item.data._id"
            @change="onBodyChange"
          >
            <template #item="{ element: row }">
              <TableRow
                :class="itemDraggable ? 'body-handle' : ''"
                :row="row.data"
                :row-index="row.index"
                :cols="cols"
                :should-show-cell="shouldShowCell"
                :selectable="selectable"
                :selected="selectedIds?.has(row.data._id)"
                @toggle="emit('toggleRow', row.data._id)"
              >
                <template
                  v-for="name in cellSlotNames"
                  :key="name"
                  #[name]="scope"
                >
                  <slot :name="name" v-bind="scope" />
                </template>
              </TableRow>
            </template>
          </draggable>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, useId, watch, nextTick, onMounted } from 'vue'
import draggable from 'vuedraggable'
import { useVirtualList, useIntersectionObserver } from '@vueuse/core'
import Resizable from './Resizable.vue'
import TableRow from './TableRow.vue'
import type { Field } from '@/types/field.interface.ts'
import type { Task } from '@/types/task.interface.ts'

interface HeaderItem {
  _id: string
  label?: string
  value: string
  width?: number
  draggable?: boolean
  sticky?: boolean
}

interface Props {
  virtualScan?: number
  bodyHeight?: number
  itemHeight?: number
  fixedHeader?: boolean
  sortable?: boolean
  itemDraggable?: boolean
  column?: any
  loading?: boolean
  selectable?: boolean
  sortKey?: string | null
  sortDir?: 'asc' | 'desc'
  selectedIds?: Set<string>
  allSelected?: boolean
  someSelected?: boolean
}

const OBSERVER_SETUP_DELAY = 100
const SCROLL_SENSITIVITY_BUFFER = 50

const componentId = useId()
const headerScroll = ref<HTMLDivElement | null>(null)
const tableBody = computed<HTMLDivElement | null>(
  () =>
    document.getElementById(
      'table-body-' + componentId,
    ) as HTMLDivElement | null,
)

const props = withDefaults(defineProps<Props>(), {
  virtualScan: 50,
  bodyHeight: 300,
  itemHeight: 44,
  fixedHeader: true,
  sortable: true,
  itemDraggable: false,
  column: undefined,
  loading: false,
  selectable: false,
  sortKey: null,
  sortDir: 'asc',
  selectedIds: undefined,
  allSelected: false,
  someSelected: false,
})

const emit = defineEmits<{
  (e: 'change', data: any): void
  (e: 'headerMoved', data: any): void
  (e: 'resizeStart'): void
  (e: 'moveRow', data: any): void
  (e: 'sort', id: string): void
  (e: 'toggleRow', id: string): void
  (e: 'toggleAll'): void
}>()

interface HeaderSlotScope {
  column: Field
  index: number
  sorted: boolean
  dir: 'asc' | 'desc'
  toggleSort: () => void
}

interface CellSlotScope {
  column: Field
  index: number
  row: any
  rowIndex: number | undefined
  value: any
}

const slots = defineSlots<{
  /** Every column header. */
  'col-header'?: (scope: HeaderSlotScope) => any
  /** One column's header, e.g. `#col-header-status`. */
  [name: `col-header-${string}`]: (scope: HeaderSlotScope) => any
  /** Every body cell. */
  'col-cell'?: (scope: CellSlotScope) => any
  /** One column's body cell, e.g. `#col-cell-status`. */
  [name: `col-cell-${string}`]: (scope: CellSlotScope) => any
}>()

const hasSlot = (name: string) => name in slots
const columnKey = (column: Field) => column.key ?? column._id

const headerScope = (column: Field, index: number): HeaderSlotScope => ({
  column,
  index,
  sorted: props.sortKey === column._id,
  dir: props.sortDir,
  toggleSort: () => emit('sort', column._id),
})

const cellSlotNames = computed(() =>
  Object.keys(slots).filter(
    (n) => n === 'col-cell' || n.startsWith('col-cell-'),
  ),
)

const cols = defineModel<Field[]>('cols', { default: () => [] })
const rows = defineModel<Task[]>('rows', { default: () => [] })

const headerDrag = ref<boolean>(false)

const reactiveItems = computed(() => rows.value || [])

const { list, containerProps, wrapperProps } = useVirtualList(reactiveItems, {
  itemHeight: props.itemHeight,
  overscan: props.virtualScan,
})

// `list` is a readonly computed; vuedraggable needs a mutable array to splice.
const draggableRows = ref<Array<{ index: number; data: Task }>>([])
watch(list, (v) => (draggableRows.value = (v ?? []).slice()), {
  immediate: true,
})

// Keep the header and body horizontal scroll positions in sync.
let syncingScroll = false
const syncScroll = (from: HTMLElement | null, to: HTMLElement | null) => {
  if (syncingScroll || !from || !to) return
  if (to.scrollLeft === from.scrollLeft) return
  syncingScroll = true
  to.scrollLeft = from.scrollLeft
  requestAnimationFrame(() => (syncingScroll = false))
}
const onHeaderScroll = () => syncScroll(headerScroll.value, tableBody.value)
const onBodyScroll = () => syncScroll(tableBody.value, headerScroll.value)

const headerOptions = computed(() => {
  const titleColumnWidth = cols.value?.[0]?.width || 250
  const leftScrollSensitivity = Math.max(
    SCROLL_SENSITIVITY_BUFFER,
    titleColumnWidth - SCROLL_SENSITIVITY_BUFFER,
  )

  return {
    animation: 200,
    group: 'table-header',
    disabled: false,
    ghostClass: 'ghost',
    scroll: headerScroll.value || true,
    scrollSensitivity: leftScrollSensitivity,
    scrollSpeed: 15,
    bubbleScroll: true,
    onStart: () => {
      headerDrag.value = true
    },
    onEnd: () => {
      headerDrag.value = false
      setTimeout(() => setupHeaderObservers(), 150)
    },
  }
})

const tableBodyWidth = computed<number>(() =>
  (cols.value ?? []).reduce(
    (acc, current) => acc + (current.width ?? 0),
    0,
  ),
)

const visibilityMap = reactive<Record<string, boolean>>({})
const observerInstances = new Map<string, { stop: () => void }>()

const visibleHeaders = computed(() =>
  Object.entries(visibilityMap)
    .filter(([, isVisible]) => isVisible)
    .map(([header]) => header),
)

const shouldShowCell = (headerItem: HeaderItem, headerIndex: number) => {
  // Always show the title column
  if (headerIndex === 0 || headerItem.sticky) return true

  // During drag operations, show all cells to prevent interaction issues
  if (headerDrag.value) return true

  // Fallback: if no headers are visible (observer failure), show all
  if (visibleHeaders.value.length === 0 && cols.value?.length > 1) {
    return true
  }

  return visibleHeaders.value.includes(headerItem._id)
}

const onHeaderMove = ({ draggedContext }: any) => {
  const { index, futureIndex } = draggedContext

  if (!props.sortable) return false

  // Prevent moving the title column, or moving anything into first position
  if (index === 0 || futureIndex === 0) return false

  return !(
    cols.value[index]?.draggable === false ||
    cols.value[futureIndex]?.draggable === false
  )
}

const change = (data: any) => emit('change', data)

const checkCanMoveItem = ({ draggedContext }: any) => {
  if (!props.itemDraggable || draggedContext.element.data.root) return false
}

// Translate an in-window drag into a reorder of the full `rows` model, by id.
const onBodyChange = (evt: any) => {
  if (!evt?.moved) return
  const movedId = evt.moved.element?.data?._id
  if (movedId == null) return

  const items = (rows.value ?? []).slice()
  const from = items.findIndex((t) => t._id === movedId)
  if (from === -1) return
  const [row] = items.splice(from, 1)

  const newIndex = evt.moved.newIndex
  const afterItem = draggableRows.value[newIndex + 1]?.data
  const beforeItem = draggableRows.value[newIndex - 1]?.data
  let to: number
  if (afterItem && afterItem._id !== movedId) {
    to = items.findIndex((t) => t._id === afterItem._id)
  } else if (beforeItem && beforeItem._id !== movedId) {
    to = items.findIndex((t) => t._id === beforeItem._id) + 1
  } else {
    to = items.length
  }
  if (to === -1) to = items.length

  items.splice(to, 0, row)
  rows.value = items
  emit('moveRow', evt.moved)
}

const setupHeaderObservers = () => {
  observerInstances.forEach((observer) => observer.stop())
  observerInstances.clear()
  Object.keys(visibilityMap).forEach((key) => delete visibilityMap[key])

  nextTick(() => {
    const headers = document
      .getElementById(componentId)
      ?.getElementsByClassName('header-item')

    if (!headers || !headerScroll.value) return

    ;[...headers].forEach((header, index) => {
      const elementId = header.getAttribute('id')
      if (!elementId) return

      visibilityMap[elementId] = true

      // Stagger observer creation to avoid conflicts
      setTimeout(() => {
        const { stop } = useIntersectionObserver(
          header as HTMLElement,
          ([{ isIntersecting }]) => {
            visibilityMap[elementId] = isIntersecting
          },
          {
            root: headerScroll.value,
            threshold: 0.1,
            rootMargin: '0px 950px 0px 950px',
          },
        )
        observerInstances.set(elementId, { stop })
      }, index * 10)
    })
  })
}

const tableHeaderMoved = (data: any) => {
  emit('headerMoved', data)
  nextTick(() => {
    cols.value.forEach((header) => {
      visibilityMap[header._id] = true
    })
    setTimeout(() => setupHeaderObservers(), OBSERVER_SETUP_DELAY)
  })
}

const resizeStart = () => emit('resizeStart')

onMounted(() => setupHeaderObservers())

watch(
  () => cols.value,
  () => setupHeaderObservers(),
  { deep: false },
)
</script>

<style>
/* Hide the header's scrollbar — the body owns the visible horizontal scrollbar */
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Resize grip on the right edge of each header cell */
.header-item .handle::before {
  content: '';
  position: absolute;
  right: 3px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  border-radius: 2px;
  background-color: transparent;
  transition: background-color 0.15s ease;
}

.header-item:hover .handle::before {
  background-color: rgb(203 213 225); /* slate-300 */
}

.header-item .handle:hover::before {
  top: 0;
  bottom: 0;
  background-color: rgb(99 102 241); /* indigo-500 */
}
</style>
