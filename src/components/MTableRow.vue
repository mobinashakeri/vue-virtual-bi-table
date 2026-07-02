<template>
  <div class="group">
    <div class="min-w-full w-fit flex">
      <div class="flex">
        <div
          v-for="(headerItem, headerIndex) in headers"
          :key="headerItem._id + row._id"
          class="w-fit flex items-center h-11 transition-colors group-hover:bg-slate-50"
          :class="{
            'sticky left-0 z-1 bg-white group-hover:bg-slate-50':
              headerIndex === 0 || headerItem.sticky,
            'bg-indigo-50/60! group-hover:bg-indigo-50!': selected,
          }"
          :style="{
            width: headerItem.width + 'px',
            minWidth: '100px',
            maxWidth: '600px',
          }"
        >
          <div
            v-if="shouldShowCell(headerItem, headerIndex)"
            class="h-full flex items-center grow w-full px-4 gap-2 relative after:absolute after:bottom-0 after:right-0 after:w-full after:border-b after:border-slate-100"
            :class="{ 'after:w-[calc(100%-16px)]!': headerIndex === 0 }"
          >
            <input
              v-if="selectable && headerIndex === 0"
              type="checkbox"
              class="h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-indigo-600"
              :checked="selected"
              @change="emit('toggle')"
            />
            <slot
              name="cell"
              :header="headerItem"
              :index="headerIndex"
              :row="row"
            >
              <span class="truncate text-slate-600">
                {{ valueOf(headerItem) }}
              </span>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  row: any
  headers: any[]
  shouldShowCell: (headerItem: any, headerIndex: number) => boolean
  selectable?: boolean
  selected?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'toggle'): void }>()

const valueOf = (headerItem: any) =>
  props.row.field.find((f: any) => f._id === headerItem._id)?.value
</script>
