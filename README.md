<div align="center">

# 🗂️ Vue Virtual Bi Table

**A high-performance, two-axis virtualized data table for Vue 3.**

Smoothly render **50,000 rows** with row virtualization, horizontal column lazy-loading,
drag-to-reorder, live resizing, and slot-driven cells — comfortable up to **~25 columns**
(more with lightweight cells). See [Performance & sizing](#-performance--sizing).

<br />

[![Vue](https://img.shields.io/badge/Vue-3.5-42b883?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![VueUse](https://img.shields.io/badge/VueUse-14-42b883?logo=vueuse&logoColor=white)](https://vueuse.org/)

<br /><br />

**[🔗 Live Demo](https://mobinashakeri.github.io/vue-virtual-bi-table/)**

</div>

---

## ✨ Why

Most table components virtualize **rows** only. Once a table gets *wide* — 20, 40, 100+
columns — every visible row still renders every cell, and the browser grinds to a halt.

**Vue Virtual Bi Table virtualizes both axes:**

- **Vertically** → only the rows in the viewport (plus a small overscan) are mounted.
- **Horizontally** → within each mounted row, only the cells whose columns are on-screen
  (or about to be) render their content.

The vertical axis scales freely (50,000 rows is comfortable); the horizontal axis is the one
to size for — see [Performance & sizing](#-performance--sizing).

<br />

<div align="center">

![Vue Virtual Bi Table demo — row scrolling, column lazy-loading, drag-to-reorder and resize](docs/demo.gif)

_Vertical + horizontal virtualization, drag-to-reorder, and live resize._

</div>

---

## 🚀 Features

| | Feature | |
|---|---|---|
| ⚡ | **Row virtualization** | Only ~visible rows + overscan are mounted (`useVirtualList`). |
| ↔️ | **Column lazy-loading** | Off-screen columns skip their cell content (`IntersectionObserver`). |
| 🔀 | **Drag-to-reorder columns** | Reorder via header drag; emits `moveColumn`. |
| 📥 | **Drag-to-reorder rows** | Optional row dragging; emits `moveRow`. |
| ↔️ | **Resizable columns** | Live width resizing with min/max clamps. |
| 📌 | **Sticky header & first column** | Both stay pinned while scrolling. |
| ↕️ | **Sorting** | Click a header to cycle asc → desc → none. |
| ☑️ | **Row selection** | Per-row checkboxes + select-all with indeterminate state. |
| 💀 | **Loading skeleton** | Shimmer placeholder rows via the `loading` prop. |
| 🧩 | **Slot-driven cells** | Fully custom header & cell rendering via scoped slots. |
| 🧰 | **`useTable` helper** | Search, sort, selection & column-visibility state you wire to your own toolbar. |
| 🛟 | **Type-safe** | Strict TypeScript end-to-end; no Tailwind required by consumers. |

---

## 📦 Installation

```bash
npm install vue-virtual-bi-table
```

`vue` (^3.5) is a peer dependency. Import the component and the stylesheet once:

```ts
import { VirtualBiTable } from "vue-virtual-bi-table";
import "vue-virtual-bi-table/style.css";
```

The stylesheet is self-contained (**no global CSS reset**), so it won't touch the rest of
your app — no Tailwind or build setup required.

---

## 🧱 Data model

Two shapes drive the table — **columns** (`Col[]`, bound to `v-model:cols`) and **rows**
(`Row[]`, bound to `v-model:rows`):

```ts
interface Col {
  _id: string          // REQUIRED — a row cell matches its column by this
  key?: string         // friendly slot id (e.g. #col-cell-<key>); use when _id is opaque
  label?: string       // header text
  width?: number       // column width in px
  value?: any          // the cell value (cells use it; columns can omit it)
  sticky?: boolean     // pin the column (the first column is always sticky)
  draggable?: boolean  // set false to lock this column's position
  [key: string]: any   // attach any extra fields you like
}

interface Row {
  _id: string          // REQUIRED — unique row id
  cells: Col[]         // REQUIRED — each entry's `_id` matches a column's `_id`
  [key: string]: any   // attach any extra fields you like
}
```

Only `_id` (and `Row.cells`) are required — everything else is optional, and you can **attach
any extra fields** (`col.myMeta`, `row.userData`, …) without upsetting the types.

**Columns and cells match by `_id`.** A row renders a column by finding the `cells` entry
whose `_id` equals the column's `_id`, then showing its `value`:

```ts
const cols: Col[] = [
  { _id: "title",      label: "Title",  width: 300, sticky: true },
  { _id: "col_8f21a9", key: "status", label: "Status", width: 150 },
];

const rows: Row[] = [
  {
    _id: "task_1",
    cells: [
      { _id: "title",      value: "Design dashboard" },
      { _id: "col_8f21a9", value: "In progress" },
    ],
  },
];
```

The Status column's `_id` is opaque, so it sets `key: "status"` — you then target its slots
as `#col-header-status` / `#col-cell-status`.

---

## 🔌 Usage

**Minimal** — just columns and rows:

```vue
<script setup lang="ts">
import { ref } from "vue";
import { VirtualBiTable, type Col, type Row } from "vue-virtual-bi-table";
import "vue-virtual-bi-table/style.css";

const cols = ref<Col[]>([
  { _id: "title", label: "Title", width: 300, sticky: true },
  { _id: "status", label: "Status", width: 150 },
]);

const rows = ref<Row[]>([
  {
    _id: "1",
    cells: [
      { _id: "title", value: "Design dashboard" },
      { _id: "status", value: "In progress" },
    ],
  },
]);
</script>

<template>
  <VirtualBiTable v-model:cols="cols" v-model:rows="rows" />
</template>
```

**Full-featured** — the `useTable` composable *manages* search, sort, selection and
column-visibility **state**. You render your own controls (search box, column toggle) and
feed the state to the table. The table stays chrome-free on purpose, so your toolbar matches
your app:

```vue
<script setup lang="ts">
import { ref } from "vue";
import { VirtualBiTable, useTable, type Col, type Row } from "vue-virtual-bi-table";
import "vue-virtual-bi-table/style.css";

const allCols = ref<Col[]>(/* your columns */);
const allRows = ref<Row[]>(/* your rows */);

const {
  search, sortKey, sortDir, toggleSort,
  visibleColumns, rows,
  selected, allSelected, someSelected, toggleRow, toggleAll,
} = useTable(allCols, allRows);
</script>

<template>
  <VirtualBiTable
    v-model:cols="visibleColumns"
    v-model:rows="rows"
    selectable
    :sort-key="sortKey"
    :sort-dir="sortDir"
    :selected-ids="selected"
    :all-selected="allSelected"
    :some-selected="someSelected"
    @sort="toggleSort"
    @toggle-row="toggleRow"
    @toggle-all="toggleAll"
  />
</template>
```

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `cols` (`v-model`) | `Col[]` | `[]` | Column definitions. Two-way for reorder/resize. |
| `rows` (`v-model`) | `Row[]` | `[]` | The rows to render. |
| `bodyHeight` | `number` | `300` | Height of the scroll viewport (px). |
| `itemHeight` | `number` | `44` | Row height, used by the virtualizer (px). |
| `overscan` | `number` | `50` | Extra rows rendered above & below the viewport. Higher = fewer blank flashes on fast scroll but more memory; lower = leaner. |
| `fixedHeader` | `boolean` | `true` | Keep the header row sticky. |
| `sortable` | `boolean` | `true` | Enable click-to-sort. When `false`, headers are static labels. (Lock one column's reorder with `draggable: false` on its `Col`.) |
| `itemDraggable` | `boolean` | `false` | Enable **row** drag-to-reorder. Pair with `v-model:rows` or listen to `@move-row`. |
| `selectable` | `boolean` | `false` | Render row + select-all checkboxes. |
| `loading` | `boolean` | `false` | Show the skeleton placeholder. |
| `sortKey` / `sortDir` | `string` / `"asc"｜"desc"` | — | Active sort column & direction (drives the indicator). |
| `selectedIds` | `Set<string>` | — | Currently-selected row ids. |
| `allSelected` / `someSelected` | `boolean` | `false` | Select-all checkbox state (incl. indeterminate). |

### Emits

`sort` · `toggleRow` · `toggleAll` · `resizeStart` · `moveRow` · `moveColumn`

**Reorder rows** — set `item-draggable`, then drag a row:

```ts
@move-row="(e: { row: Row; oldIndex: number; newIndex: number; rows: Row[] }) => { … }"
```

`e.rows` is the already-reordered array. With `v-model:rows` the new order is applied for you.
(Row drag is best when the list isn't sorted/filtered — `useTable` exposes `isSourceOrder`.)

**Reorder columns** — drag a header (`v-model:cols` already holds the new order):

```ts
@move-column="(e: { column: Col; oldIndex: number; newIndex: number; cols: Col[] }) => { … }"
```

### Slots

Customize any header or body cell. Target **one** column by its `key` (falls back to `_id`),
or **all** columns via the fallback slot:

| Slot | Scope | Renders |
|---|---|---|
| `#col-header` | `{ column, index, sorted, dir, sortable, toggleSort }` | every header |
| `#col-header-<key>` | same | one column's header (e.g. `#col-header-status`) |
| `#col-cell` | `{ column, value, row, rowIndex, index }` | every body cell |
| `#col-cell-<key>` | same | one column's body cell (e.g. `#col-cell-status`) |

Resolution is **per-column → fallback → built-in default**. The checkbox, resize grip and
drag handle stay *outside* the slot, so a custom header keeps sorting (call `toggleSort`),
resizing and dragging. `value` is pre-resolved, so you never touch the internal row shape.

```vue
<VirtualBiTable v-model:cols="cols" v-model:rows="rows">
  <template #col-header-status="{ column, sorted, dir, toggleSort }">
    <button @click="toggleSort">
      {{ column.label }} <span v-if="sorted">{{ dir === "asc" ? "↑" : "↓" }}</span>
    </button>
  </template>

  <template #col-cell-status="{ value }">
    <StatusPill :value="value" />
  </template>
</VirtualBiTable>
```

---

## ⚡ Performance & sizing

The two axes scale very differently.

**Rows scale freely.** Only the rows in the viewport (plus overscan) are ever mounted, so
scrolling cost is fixed by what's *visible*, not the total — **50,000 rows stay smooth.** At
that scale the ceiling is memory (each row holds one cell per column), not rendering.

**Columns are the axis to watch.** Every mounted row renders one cell per column, so per-row
work grows with the column count. With typical cells (text, badges, small components):

| Columns | Scrolling |
|---|---|
| ≤ 15 | effortless (~60 fps) |
| **~25** | **smooth for everyday use — recommended ceiling** |
| 40–50 | usable, but choppy on fast scrolling |
| 100+ | janky |

**Rules of thumb**

- **50,000 rows × ~25 columns** is the comfortable sweet spot.
- Go **beyond 25 columns when cells are lightweight** (plain text / small badges).
- A **heavy component in every cell** (charts, editors) lowers the ceiling — keep it **≤ ~25
  columns**, and use `#col-cell-<key>` to put heavy cells only where needed.
- **Hide columns you don't need** — only rendered columns cost anything.
- Lower `overscan` to trim memory and mount cost.

> Measured in Chrome with 50,000 rows; numbers vary with hardware, column widths, and cell
> complexity.

---

## 🧠 How it works

```mermaid
flowchart TD
    A[1,000 rows × 25 columns<br/>= 25,000 potential cells] --> B{Vertical<br/>virtualization}
    B -->|useVirtualList| C[~60 rows mounted<br/>visible + overscan]
    C --> D{Horizontal<br/>lazy-loading}
    D -->|IntersectionObserver<br/>per column| E[Only on-screen columns<br/>render cell content]
    E --> F[≈ a few hundred live cells<br/>instead of 25,000]
```

**Vertical axis —** `useVirtualList` (VueUse) computes the visible window from scroll
position and item height, mounting only those rows. A spacer reserves the full scroll height
so the scrollbar behaves naturally.

**Horizontal axis —** each header registers an `IntersectionObserver` against the
horizontally-scrolling container with a generous `rootMargin`, so cells are ready *before*
they scroll in. A reactive `visibilityMap` drives `shouldShowCell()`: off-screen columns
render an empty, correctly-sized placeholder instead of their content.

---

## 🧑‍💻 Local development

```bash
npm install
npm run dev          # demo dev server
npm run build        # type-check + production (demo) build
npm run build:lib    # build the publishable package into dist/
npm run test:run     # unit tests (Vitest)
npm run type-check   # vue-tsc
```

Pushing to `main` builds, tests, and deploys the live demo to GitHub Pages.

### Project layout

```
src/
├── components/
│   ├── VirtualBiTable.vue   # the published table (virtualization, DnD, slots)
│   ├── TableRow.vue         # a single row — internal
│   ├── Resizable.vue        # resize wrapper — exported
│   ├── Example.vue          # demo only (NOT published): toolbar + useTable wiring
│   ├── TableHeaderCell.vue  # demo only: example header renderer (branches on column.key)
│   └── TableBodyCell.vue    # demo only: example cell renderer (branches on column.key)
├── composables/
│   ├── useTable.ts          # search → filter → sort, selection, column visibility — exported
│   └── useMockData.ts       # demo only: generates realistic rows
├── types/
│   ├── col.interface.ts     # Col — column definition
│   └── row.interface.ts     # Row — row (id + cells)
└── App.vue                  # demo page shell
```

Published API (from `src/index.ts`): `VirtualBiTable`, `Resizable`, `useTable`, and types
`Col`, `Row`, `SortDir`.

---

## 🛠️ Built with

[Vue 3](https://vuejs.org/) · [TypeScript](https://www.typescriptlang.org/) ·
[Vite](https://vite.dev/) · [VueUse](https://vueuse.org/) (`useVirtualList`,
`useIntersectionObserver`) · [vuedraggable](https://github.com/SortableJS/vue.draggable.next)
(SortableJS)

---

## 👤 Author

**Mobina Shakeri** — [GitHub](https://github.com/mobinashakeri) · [LinkedIn](https://www.linkedin.com/in/mobina-shakeri)

## 📄 License

[MIT](LICENSE)
