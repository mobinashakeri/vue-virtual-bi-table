import type { Field } from './field.interface'

export interface Task {
  _id: string
  field: Field[]
}
