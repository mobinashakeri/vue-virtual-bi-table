import { computed, ref, type Ref } from 'vue'
import type { Col } from '../types/col.interface'
import type { Row } from '../types/row.interface'

export type SortDir = 'asc' | 'desc'

/**
 * Table state pipeline: global search → filter → sort, plus row selection
 * and column visibility. Keeps the raw `fields`/`tasks` as the source of truth
 * and derives everything the table needs.
 */
export function useTable(fields: Ref<Col[]>, tasks: Ref<Row[]>) {
  const search = ref('')
  const sortKey = ref<string | null>(null)
  const sortDir = ref<SortDir>('asc')
  const hiddenIds = ref<Set<string>>(new Set())
  const selected = ref<Set<string>>(new Set())

  const valueOf = (task: Row, id: string) =>
    task.cells.find((f) => f._id === id)?.value

  /* ------------------------------- Columns ------------------------------- */

  // Visible columns, writable so the table's reorder/resize flow back to `fields`.
  const visibleColumns = computed<Col[]>({
    get: () => fields.value.filter((f) => !hiddenIds.value.has(f._id)),
    set: (nextVisible) => {
      const hidden = fields.value.filter((f) => hiddenIds.value.has(f._id))
      fields.value = [...nextVisible, ...hidden]
    },
  })

  const isHidden = (id: string) => hiddenIds.value.has(id)
  const toggleColumn = (id: string) => {
    const next = new Set(hiddenIds.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    hiddenIds.value = next
  }

  /* -------------------------------- Sort --------------------------------- */

  const toggleSort = (id: string) => {
    if (sortKey.value !== id) {
      sortKey.value = id
      sortDir.value = 'asc'
    } else if (sortDir.value === 'asc') {
      sortDir.value = 'desc'
    } else {
      sortKey.value = null // third click clears the sort
    }
  }

  /* --------------------------- Search + rows ----------------------------- */

  // Whether the rendered view maps 1:1 onto `tasks` (no filter/sort reshaping it).
  // Only then can a manual drag-reorder be written back to the source.
  const isSourceOrder = computed(
    () => !sortKey.value && search.value.trim() === '',
  )

  const rows = computed<Row[]>({
    get: () => {
      const q = search.value.trim().toLowerCase()

      const result = q
        ? tasks.value.filter((t) =>
            t.cells.some((f) =>
              String(f.value ?? '')
                .toLowerCase()
                .includes(q),
            ),
          )
        : tasks.value.slice()

      if (sortKey.value) {
        const key = sortKey.value
        const dir = sortDir.value === 'asc' ? 1 : -1
        result.sort((a, b) => {
          const av = valueOf(a, key)
          const bv = valueOf(b, key)
          if (av == null) return 1
          if (bv == null) return -1
          if (typeof av === 'number' && typeof bv === 'number') {
            return (av - bv) * dir
          }
          return String(av).localeCompare(String(bv)) * dir
        })
      }

      return result
    },
    // Drag-to-reorder pushes a new row order back to the source, but only when
    // the view isn't filtered or sorted (otherwise the mapping is ambiguous).
    set: (next) => {
      if (!isSourceOrder.value) return
      tasks.value = next
    },
  })

  /* ------------------------------ Selection ------------------------------ */

  const isSelected = (id: string) => selected.value.has(id)

  const toggleRow = (id: string) => {
    const next = new Set(selected.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    selected.value = next
  }

  const allSelected = computed(
    () =>
      rows.value.length > 0 &&
      rows.value.every((r) => selected.value.has(r._id)),
  )
  const someSelected = computed(
    () =>
      !allSelected.value && rows.value.some((r) => selected.value.has(r._id)),
  )

  const toggleAll = () => {
    selected.value = allSelected.value
      ? new Set()
      : new Set(rows.value.map((r) => r._id))
  }

  const clearSelection = () => (selected.value = new Set())

  return {
    // search
    search,
    // sort
    sortKey,
    sortDir,
    toggleSort,
    // columns
    visibleColumns,
    isHidden,
    toggleColumn,
    // rows
    rows,
    isSourceOrder,
    // selection
    selected,
    isSelected,
    toggleRow,
    allSelected,
    someSelected,
    toggleAll,
    clearSelection,
  }
}
