export interface Col {
  /** Required — unique id. A row cell matches its column by this. */
  _id: string
  key?: string
  label?: string
  width?: number
  value?: any
  sticky?: boolean
  draggable?: boolean
  /** Attach any extra fields you like — they're passed through untouched. */
  [key: string]: any
}
