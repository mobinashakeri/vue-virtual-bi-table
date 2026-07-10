import { ref, shallowRef } from 'vue'
import type { Row } from '../types/row.interface'
import type { Col } from '../types/col.interface'

/* -------------------------------------------------------------------------- */
/*  Column definitions — single source of truth for label + width             */
/* -------------------------------------------------------------------------- */

const COLUMNS: Omit<Col, 'value'>[] = [
  { _id: 'title', label: 'Title', width: 300, sticky: true },
  // Opaque _id + friendly `key`: slots target the `key` (#col-cell-status), not _id.
  { _id: 'col_8f21a9', key: 'status', label: 'Status', width: 150 },
  { _id: 'priority', key: 'priority', label: 'Priority', width: 130 },
  { _id: 'severity', label: 'Severity', width: 140 },
  { _id: 'assignee', label: 'Assignee', width: 190 },
  { _id: 'reporter', label: 'Reporter', width: 190 },
  { _id: 'team', label: 'Team', width: 140 },
  { _id: 'sprint', label: 'Sprint', width: 130 },
  { _id: 'epic', label: 'Epic', width: 160 },
  { _id: 'component', label: 'Component', width: 150 },
  { _id: 'environment', label: 'Environment', width: 160 },
  { _id: 'storyPoints', label: 'Story points', width: 130 },
  { _id: 'estimate', label: 'Estimate', width: 120 },
  { _id: 'timeSpent', label: 'Time spent', width: 130 },
  { _id: 'progress', label: 'Progress', width: 170 },
  { _id: 'startDate', label: 'Start date', width: 150 },
  { _id: 'dueDate', label: 'Due date', width: 150 },
  { _id: 'createdDate', label: 'Created', width: 150 },
  { _id: 'updatedDate', label: 'Updated', width: 150 },
  { _id: 'tags', label: 'Tags', width: 200 },
  { _id: 'reviewer', label: 'Reviewer', width: 190 },
  { _id: 'resolution', label: 'Resolution', width: 150 },
  { _id: 'labels', label: 'Labels', width: 150 },
  { _id: 'watchers', label: 'Watchers', width: 120 },
  { _id: 'rank', label: 'Rank', width: 100 },
]

/* -------------------------------------------------------------------------- */
/*  Value pools                                                                */
/* -------------------------------------------------------------------------- */

const TITLES = [
  'Design dashboard layout',
  'Implement authentication API',
  'Fix table sorting bug',
  'Write unit tests for store',
  'Add dark mode support',
  'Refactor state management',
  'Update documentation',
  'Optimize query performance',
  'Review pull request',
  'Set up CI pipeline',
]
const STATUSES = ['To do', 'In progress', 'In review', 'Done']
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent']
const ASSIGNEES = [
  'Alice Johnson',
  'Bob Smith',
  'Carla Diaz',
  'David Lee',
  'Eva Brown',
]
const TAGS = ['Frontend', 'Backend', 'Design', 'Bug', 'Docs']
const SEVERITIES = ['Minor', 'Major', 'Critical', 'Blocker']
const TEAMS = ['Platform', 'Growth', 'Payments', 'Mobile', 'Infra']
const EPICS = ['Onboarding', 'Checkout', 'Search', 'Notifications', 'Reporting']
const COMPONENTS = ['Auth', 'Billing', 'API', 'UI', 'Database']
const ENVIRONMENTS = ['Development', 'Staging', 'Production']
const RESOLUTIONS = ['Unresolved', 'Fixed', 'Duplicate', "Won't fix"]
const POINTS = [1, 2, 3, 5, 8, 13]

const pick = <T>(arr: T[], i: number): T => arr[i % arr.length]
const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

/** A YYYY-MM-DD date offset by a random number of days within [minDays, maxDays]. */
function randomDate(minDays: number, maxDays: number): string {
  const days = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10)
}

/* -------------------------------------------------------------------------- */
/*  Build the value for a given column                                        */
/* -------------------------------------------------------------------------- */

function valueFor(columnId: string, i: number): any {
  switch (columnId) {
    case 'title':
      return `#${i + 1} ${pick(TITLES, i)}`
    case 'status':
      return pick(STATUSES, i)
    case 'priority':
      return rand(PRIORITIES)
    case 'severity':
      return rand(SEVERITIES)
    case 'assignee':
    case 'reporter':
      return rand(ASSIGNEES)
    case 'team':
      return rand(TEAMS)
    case 'sprint':
      return `Sprint ${(i % 12) + 1}`
    case 'epic':
      return rand(EPICS)
    case 'component':
      return rand(COMPONENTS)
    case 'environment':
      return rand(ENVIRONMENTS)
    case 'storyPoints':
      return rand(POINTS)
    case 'estimate':
      return Math.floor(Math.random() * 40) + 1
    case 'timeSpent':
      return Math.floor(Math.random() * 40)
    case 'progress':
      return Math.round((Math.random() * 100) / 5) * 5
    case 'startDate':
      return randomDate(-30, -1)
    case 'dueDate':
      return randomDate(1, 45)
    case 'createdDate':
      return randomDate(-90, -30)
    case 'updatedDate':
      return randomDate(-14, 0)
    case 'tags':
      return [rand(TAGS), rand(TAGS)]
    case 'reviewer':
      return rand(ASSIGNEES)
    case 'resolution':
      return rand(RESOLUTIONS)
    case 'labels':
      return rand(TAGS)
    case 'watchers':
      return Math.floor(Math.random() * 10)
    case 'rank':
      return i + 1
    default:
      return ''
  }
}

/* -------------------------------------------------------------------------- */
/*  Create one task (same shape as your mock)                                 */
/* -------------------------------------------------------------------------- */

function createTask(i: number): Row {
  return {
    _id: `task_${i + 1}`,
    cells: COLUMNS.map((col) => ({
      _id: col._id,
      label: col.label,
      width: col.width,
      value: valueFor(col.key ?? col._id, i),
    })),
  }
}

/* -------------------------------------------------------------------------- */
/*  Composable                                                                */
/* -------------------------------------------------------------------------- */

export function useMockData(initialCount = 5) {
  const count = ref(initialCount) // bind this to an input
  const tasks = shallowRef<Row[]>([]) // shallowRef keeps large lists fast
  const isGenerating = ref(false)

  // The columns for your table header (label + width, no value).
  const fields = ref<Col[]>(COLUMNS.map((c) => ({ ...c, value: '' })))

  /** Generate `n` tasks (defaults to current `count`). Handles 1000+ fine. */
  function generate(n: number = count.value): Row[] {
    isGenerating.value = true
    count.value = n

    const result = new Array<Row>(n)
    for (let i = 0; i < n; i++) result[i] = createTask(i)

    tasks.value = result
    isGenerating.value = false
    return result
  }

  /** Append `n` more tasks to the existing list. */
  function addMore(n: number): void {
    const start = tasks.value.length
    const extra = new Array<Row>(n)
    for (let i = 0; i < n; i++) extra[i] = createTask(start + i)
    tasks.value = [...tasks.value, ...extra]
    count.value = tasks.value.length
  }

  /** Empty the list. */
  function clear(): void {
    tasks.value = []
    count.value = 0
  }

  return { count, tasks, fields, isGenerating, generate, addMore, clear }
}
