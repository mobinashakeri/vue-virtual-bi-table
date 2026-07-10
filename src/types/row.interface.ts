import type { Col } from './col.interface'

export interface Row {
  /** Required — unique row id. */
  _id: string
  /** Required — the row's cells; each entry's `_id` matches a column's `_id`. */
  cells: Col[]
  /** Attach any extra fields you like — they're passed through untouched. */
  [key: string]: any
}
