import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useTable } from '../useTable'
import type { Col } from '@/types/col.interface'
import type { Row } from '@/types/row.interface'

const makeFields = () =>
  ref<Col[]>([
    { _id: 'title', label: 'Title', width: 100, value: '', sticky: true },
    { _id: 'age', label: 'Age', width: 80, value: 0 },
  ])

const makeTasks = () =>
  ref<Row[]>([
    {
      _id: 't1',
      cells: [
        { _id: 'title', label: 'Title', value: 'Banana' },
        { _id: 'age', label: 'Age', value: 30 },
      ],
    },
    {
      _id: 't2',
      cells: [
        { _id: 'title', label: 'Title', value: 'apple' },
        { _id: 'age', label: 'Age', value: 10 },
      ],
    },
    {
      _id: 't3',
      cells: [
        { _id: 'title', label: 'Title', value: 'Cherry' },
        { _id: 'age', label: 'Age', value: 20 },
      ],
    },
  ])

const ids = (rows: Row[]) => rows.map((r) => r._id)

describe('useTable — search', () => {
  it('filters across all columns, case-insensitively', () => {
    const t = useTable(makeFields(), makeTasks())
    t.search.value = 'APP'
    expect(ids(t.rows.value)).toEqual(['t2'])
  })

  it('returns all rows when the query is empty', () => {
    const t = useTable(makeFields(), makeTasks())
    expect(t.rows.value).toHaveLength(3)
  })
})

describe('useTable — sort', () => {
  it('sorts numbers ascending and descending', () => {
    const t = useTable(makeFields(), makeTasks())
    t.toggleSort('age') // asc
    expect(ids(t.rows.value)).toEqual(['t2', 't3', 't1'])
    t.toggleSort('age') // desc
    expect(ids(t.rows.value)).toEqual(['t1', 't3', 't2'])
  })

  it('clears the sort on the third toggle', () => {
    const t = useTable(makeFields(), makeTasks())
    t.toggleSort('age')
    t.toggleSort('age')
    t.toggleSort('age')
    expect(t.sortKey.value).toBeNull()
    expect(ids(t.rows.value)).toEqual(['t1', 't2', 't3'])
  })
})

describe('useTable — selection', () => {
  it('toggles a single row', () => {
    const t = useTable(makeFields(), makeTasks())
    t.toggleRow('t1')
    expect(t.isSelected('t1')).toBe(true)
    t.toggleRow('t1')
    expect(t.isSelected('t1')).toBe(false)
  })

  it('select-all reflects allSelected and clears', () => {
    const t = useTable(makeFields(), makeTasks())
    t.toggleAll()
    expect(t.allSelected.value).toBe(true)
    expect(t.selected.value.size).toBe(3)
    t.toggleAll()
    expect(t.selected.value.size).toBe(0)
  })

  it('someSelected is true for a partial selection', () => {
    const t = useTable(makeFields(), makeTasks())
    t.toggleRow('t1')
    expect(t.someSelected.value).toBe(true)
    expect(t.allSelected.value).toBe(false)
  })
})

describe('useTable — column visibility', () => {
  it('hides and shows a column', () => {
    const t = useTable(makeFields(), makeTasks())
    expect(t.visibleColumns.value).toHaveLength(2)
    t.toggleColumn('age')
    expect(t.isHidden('age')).toBe(true)
    expect(t.visibleColumns.value.map((c) => c._id)).toEqual(['title'])
    t.toggleColumn('age')
    expect(t.visibleColumns.value).toHaveLength(2)
  })
})
