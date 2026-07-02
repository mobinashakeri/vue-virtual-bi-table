<template>
  <div
    class="relative h-full"
    :style="{
      width: internalWidth + 'px',
      maxWidth: props.maxWidth + 'px',
      minWidth: props.minWidth + 'px',
    }"
    @mouseover="hovered = true"
    @mouseleave="hovered = false"
  >
    <slot></slot>
    <div
      v-for="handler in props.handles"
      v-show="(showOnHover && hovered) || !showOnHover"
      :id="`resize_handler_${componentId}_${handler}`"
      :key="handler"
      class="handle absolute z-50"
      :class="{
        'h-full w-3 top-0 bottom-0 cursor-ew-resize': ['r', 'l'].includes(
          handler,
        ),
        'w-full h-4 left-0 right-0 cursor-ns-resize ': ['t', 'b'].includes(
          handler,
        ),
        'right-0': handler === 'r' && !props.outside,
        'left-0': handler === 'l' && !props.outside,
        'top-0': handler === 't' && !props.outside,
        'bottom-0': handler === 'b' && !props.outside,
        '-right-3': handler === 'r' && props.outside,
        '-left-3': handler === 'l' && props.outside,
        '-top-3': handler === 't' && props.outside,
        '-bottom-3': handler === 'b' && props.outside,
      }"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, useId, watch } from 'vue'
type HandleType = 't' | 'r' | 'b' | 'l'
interface Props {
  handles?: HandleType[]
  showOnHover?: boolean
  maxHeight?: number
  maxWidth?: number
  minHeight?: number
  minWidth?: number
  width?: number
  height?: number
  isResizing?: boolean
  outside?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  handles: () => [],
  showOnHover: true,
  maxHeight: 500,
  minHeight: 50,
  maxWidth: 500,
  minWidth: 50,
  width: 200,
  height: 50,
  isResizing: false,
  outside: false,
})

const emit = defineEmits<{
  (e: 'update:width', val: number): void
  (e: 'update:height', val: number): void
  (e: 'update:isResizing', val: boolean): void
  (e: 'resizeStart'): void
  (e: 'resizeEnd'): void
}>()

const internalWidth = ref(props.width)
const internalHeight = ref(props.height)
const internalIsResizing = ref(props.isResizing)

watch(
  () => props.width,
  (val: number) => {
    if (val !== undefined) internalWidth.value = val
  },
)
watch(
  () => props.height,
  (val: number) => {
    if (val !== undefined) internalHeight.value = val
  },
)
watch(
  () => props.isResizing,
  (val: boolean) => {
    if (val !== undefined) internalIsResizing.value = val
  },
)

const hovered = ref<boolean>(false)

const componentId = useId()

const startX = ref<number>(0)
const startY = ref<number>(0)
const startWidth = ref<number>(0)
const startHeight = ref<number>(0)
const movingHandle = ref<string>('')

onMounted(() => {
  props.handles.forEach((handler: string) => {
    document
      .getElementById(`resize_handler_${componentId}_${handler}`)
      ?.addEventListener('mousedown', function (event) {
        event.stopPropagation()
        event.preventDefault()
        startResize(event, handler)
      })
  })
})

onUnmounted(() => {
  document.removeEventListener('mousemove', resize)
  document.removeEventListener('mouseup', stopResize)
})

const startResize = (event: any, handle: string) => {
  event.stopPropagation()
  internalIsResizing.value = true
  startX.value = event.clientX
  startY.value = event.clientY
  startWidth.value = internalWidth.value
  startHeight.value = internalHeight.value
  movingHandle.value = handle

  document.addEventListener('mousemove', resize)
  document.addEventListener('mouseup', stopResize)
  emit('resizeStart')
}

const resize = (event: any) => {
  event.stopPropagation()
  event.preventDefault()
  if (!internalIsResizing.value) return

  const deltaX = event.clientX - startX.value
  const deltaY = event.clientY - startY.value
  if (movingHandle.value == 'r') {
    if (
      startWidth.value + deltaX > props.maxWidth ||
      startWidth.value + deltaX < props.minWidth
    ) {
      return
    }
    internalWidth.value = startWidth.value + deltaX
    emit('update:width', internalWidth.value)
  }
  if (movingHandle.value == 'l') {
    if (startWidth.value - deltaX < props.minWidth) return
    internalWidth.value = startWidth.value - deltaX
    emit('update:width', internalWidth.value)
  }
  if (movingHandle.value == 'b') {
    if (startHeight.value + deltaY > props.maxHeight) return
    internalHeight.value = startHeight.value + deltaY
    emit('update:height', internalHeight.value)
  }
  if (movingHandle.value == 't') {
    if (startHeight.value - deltaY < props.minHeight) return
    internalHeight.value = startHeight.value - deltaY
    emit('update:height', internalHeight.value)
  }
}

const stopResize = () => {
  internalIsResizing.value = false
  movingHandle.value = ''
  document.removeEventListener('mousemove', resize)
  document.removeEventListener('mouseup', stopResize)
  emit('resizeEnd')
}
</script>
