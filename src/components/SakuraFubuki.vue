<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let animationId: number | null = null
let resizeHandler: (() => void) | null = null

interface Petal {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  rotation: number
  rotationSpeed: number
  opacity: number
  color: string
  swayOffset: number
  swaySpeed: number
}

const PETAL_COUNT = 55
const COLORS = ['#FFB7C5', '#FFC4CE', '#FF8FAB', '#FFD6DD', '#FFA3B5', '#FFCCD4']

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function createPetal(canvas: HTMLCanvasElement, fromTop = false): Petal {
  return {
    x: randomBetween(0, canvas.width),
    y: fromTop ? randomBetween(-80, -10) : randomBetween(-canvas.height, canvas.height),
    size: randomBetween(7, 16),
    speedX: randomBetween(-0.6, 0.6),
    speedY: randomBetween(1.2, 2.8),
    rotation: randomBetween(0, Math.PI * 2),
    rotationSpeed: randomBetween(-0.04, 0.04),
    opacity: randomBetween(0.45, 0.85),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    swayOffset: randomBetween(0, Math.PI * 2),
    swaySpeed: randomBetween(0.008, 0.022),
  }
}

function drawPetal(context: CanvasRenderingContext2D, petal: Petal) {
  context.save()
  context.translate(petal.x, petal.y)
  context.rotate(petal.rotation)
  context.globalAlpha = petal.opacity

  context.fillStyle = petal.color
  context.beginPath()
  context.moveTo(0, 0)
  context.bezierCurveTo(
    petal.size * 0.6, -petal.size * 0.35,
    petal.size * 1.1, petal.size * 0.4,
    0, petal.size * 1.1
  )
  context.bezierCurveTo(
    -petal.size * 1.1, petal.size * 0.4,
    -petal.size * 0.6, -petal.size * 0.35,
    0, 0
  )
  context.fill()

  context.strokeStyle = 'rgba(255,255,255,0.35)'
  context.lineWidth = 0.8
  context.beginPath()
  context.moveTo(0, 0)
  context.lineTo(0, petal.size * 0.9)
  context.stroke()

  context.restore()
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const petals: Petal[] = Array.from({ length: PETAL_COUNT }, () =>
    createPetal(canvas, false)
  )

  resizeHandler = () => {
    if (!canvasRef.value) return
    canvasRef.value.width = window.innerWidth
    canvasRef.value.height = window.innerHeight
  }
  window.addEventListener('resize', resizeHandler)

  let lastTime = 0

  function animate(now: number) {
    const currentCanvas = canvasRef.value
    const currentCtx = ctx
    if (!currentCanvas || !currentCtx) return

    const delta = Math.min((now - lastTime) / 16.67, 3)
    lastTime = now

    currentCtx.clearRect(0, 0, currentCanvas.width, currentCanvas.height)

    for (const petal of petals) {
      drawPetal(currentCtx, petal)

      const sway = Math.sin(now * petal.swaySpeed + petal.swayOffset) * 0.8
      petal.x += (petal.speedX + sway) * delta
      petal.y += petal.speedY * delta
      petal.rotation += petal.rotationSpeed * delta

      const margin = petal.size * 2
      if (
        petal.y > currentCanvas.height + margin ||
        petal.x < -margin ||
        petal.x > currentCanvas.width + margin
      ) {
        Object.assign(petal, createPetal(currentCanvas, true))
      }
    }

    animationId = requestAnimationFrame(animate)
  }

  animationId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animationId !== null) cancelAnimationFrame(animationId)
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  ctx = null
})
</script>

<template>
  <canvas ref="canvasRef" class="sakura-canvas" />
</template>

<style scoped>
.sakura-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}
</style>
