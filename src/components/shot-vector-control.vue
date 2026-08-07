<template>
  <div
    class="pointer-events-none duration-300"
    :class="{ 'opacity-100': dragActive, 'opacity-0': !dragActive }"
  >
    <div
      class="fixed left-0 top-0 h-[1px] origin-left bg-blue-500"
      :style="lineStyle"
    />
    <div
      class="point fixed left-0 top-0 aspect-square w-20 border-2 border-blue-300 rounded-full border-dashed opacity-60"
      :style="startPointStyle"
    />
  </div>
</template>

<script setup lang="ts">
import { useEventListener, useMouse, useVibrate } from '@vueuse/core'
import { debounce } from 'lodash-es'
import { computed, reactive, ref, watch } from 'vue'

interface Emits {
  start: [data: {
    startPoint: { x: number; y: number };
  }];
  update: [data: {
    startPoint: { x: number; y: number };
    endPoint: { x: number; y: number };
  }];
  commit: [data: {
    startPoint: { x: number; y: number };
    endPoint: { x: number; y: number };
    direction: { x: number; y: number };
    length: number;
  }];
}
const emit = defineEmits<Emits>()

const mouse = reactive(useMouse({ type: 'client' }))
const { vibrate } = useVibrate({ pattern: [10] })

const startPoint = ref({ x: 0, y: 0 })
const lastPoint = ref({ x: 0, y: 0 })

const LONG_PRESS_MS = 500
const MOVE_TOLERANCE = 8

const touchActive = ref(false)
const touchCandidateId = ref<number>()
const touchPoint = ref({ x: 0, y: 0 })
const longPressStart = ref({ x: 0, y: 0 })
let longPressTimer: ReturnType<typeof setTimeout> | undefined

function clearLongPressTimer() {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = undefined
  }
}

function handlePointerDown(e: PointerEvent) {
  if (e.pointerType === 'touch') {
    touchCandidateId.value = e.pointerId
    touchPoint.value = { x: e.clientX, y: e.clientY }
    lastPoint.value = { ...touchPoint.value }
    longPressStart.value = { ...touchPoint.value }
    clearLongPressTimer()
    longPressTimer = setTimeout(() => {
      touchActive.value = true
      vibrate()
    }, LONG_PRESS_MS)
  }
  else if (e.pointerType === 'mouse') {
    updateMouseButtons(e)
  }
}

function handlePointerMove(e: PointerEvent) {
  if (e.pointerType === 'touch') {
    if (touchCandidateId.value === e.pointerId) {
      touchPoint.value = { x: e.clientX, y: e.clientY }
      lastPoint.value = { ...touchPoint.value }

      if (!touchActive.value && longPressTimer) {
        // 長按倒數期間若移動超過容忍值，就取消長按（視為一般滑動）
        const dx = touchPoint.value.x - longPressStart.value.x
        const dy = touchPoint.value.y - longPressStart.value.y
        if (Math.hypot(dx, dy) > MOVE_TOLERANCE) {
          clearLongPressTimer()
        }
      }
    }
  }
  else if (e.pointerType === 'mouse') {
    updateMouseButtons(e)
  }
}

function handlePointerUp(e: PointerEvent) {
  if (e.pointerType === 'touch') {
    if (touchCandidateId.value === e.pointerId) {
      clearLongPressTimer()
      touchActive.value = false
      touchCandidateId.value = undefined
    }
  }
  else if (e.pointerType === 'mouse') {
    updateMouseButtons(e)
  }
}

const mouseActive = ref(false)
let passNextContextMenu = false
const setPassNextContextMenu = debounce(() => {
  passNextContextMenu = false
}, 200)
function updateMouseButtons(evt: PointerEvent) {
  /** 左鍵是 1、右鍵是 2，兩個一起按則為 1|2 */
  const buttons = evt.buttons ?? 0
  const isBoth = (buttons & 1) !== 0 && (buttons & 2) !== 0
  mouseActive.value = isBoth

  lastPoint.value = { x: mouse.x, y: mouse.y }

  if (isBoth) {
    passNextContextMenu = true
  }
  else {
    // 推延更新，以免 preventContextMenu 時無法正確判斷
    setPassNextContextMenu()
  }
}
function preventContextMenu(evt: MouseEvent) {
  if (passNextContextMenu)
    evt.preventDefault()
}

const dragActive = computed(() => mouseActive.value || touchActive.value)
const cursor = computed(() => (touchCandidateId.value !== undefined
  ? touchPoint.value
  : { x: mouse.x, y: mouse.y }),
)

const startPointStyle = computed(() => ({
  left: `${startPoint.value.x}px`,
  top: `${startPoint.value.y}px`,
}))

const lineStyle = computed(() => {
  const x1 = startPoint.value.x
  const y1 = startPoint.value.y
  const x2 = cursor.value.x
  const y2 = cursor.value.y
  const dx = x2 - x1
  const dy = y2 - y1
  const length = Math.hypot(dx, dy)
  const angle = Math.atan2(dy, dx) * 180 / Math.PI
  return {
    width: `${length}px`,
    transform: `translate(${x1}px, ${y1}px) rotate(${angle}deg)`,
  }
})

// 監看開始/結束（沿用原本流程）
watch(dragActive, (active) => {
  if (active) {
    startPoint.value = { x: lastPoint.value.x, y: lastPoint.value.y }
    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'
    emit('start', {
      startPoint: startPoint.value,
    })
    return
  }

  document.body.style.cursor = ''
  document.body.style.userSelect = ''

  const dx = lastPoint.value.x - startPoint.value.x
  const dy = lastPoint.value.y - startPoint.value.y
  const length = Math.hypot(dx, dy)

  const direction = { x: -dx / length, y: -dy / length }
  emit('commit', {
    startPoint: startPoint.value,
    endPoint: { x: lastPoint.value.x, y: lastPoint.value.y },
    direction,
    length,
  })
})

useEventListener('contextmenu', preventContextMenu, { capture: true })
useEventListener('pointerdown', handlePointerDown, { passive: false })
useEventListener('pointermove', handlePointerMove, { passive: false })
useEventListener('pointerup', handlePointerUp)
useEventListener('pointercancel', handlePointerUp)

/** 防止觸控捲動視窗 */
useEventListener('touchmove', (e: TouchEvent) => {
  if (touchActive.value)
    e.preventDefault()
}, { passive: false })
</script>

<style scoped lang="sass">
.point
  transform: translate3d(-50%, -50%, 0)
</style>
