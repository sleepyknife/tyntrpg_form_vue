<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { sakuraState } from '../composables/secret-effects'

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
  swayAngle: number
  swaySpeed: number
  swayAmplitude: number
  shapeType: number
}

let petals: Petal[] = []

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function createPetal(canvas: HTMLCanvasElement, fromTop = false): Petal {
  return {
    x: randomBetween(0, canvas.width),
    y: fromTop ? randomBetween(-80, -10) : randomBetween(-canvas.height, canvas.height),
    size: randomBetween(7, 16),
    speedX: randomBetween(-0.3, 0.3),
    speedY: randomBetween(0.25, 0.65),
    rotation: randomBetween(0, Math.PI * 2),
    rotationSpeed: randomBetween(-0.02, 0.02),
    opacity: randomBetween(0.45, 0.85),
    color: sakuraState.colors[Math.floor(Math.random() * sakuraState.colors.length)],
    swayAngle: randomBetween(0, Math.PI * 2),
    swaySpeed: randomBetween(0.01, 0.03),
    swayAmplitude: randomBetween(0.8, 2.2),
    shapeType: Math.floor(Math.random() * 4),
  }
}

function drawPetal(context: CanvasRenderingContext2D, petal: Petal) {
  context.save()
  context.translate(petal.x, petal.y)
  context.rotate(petal.rotation)
  context.globalAlpha = petal.opacity
  context.fillStyle = petal.color

  const s = petal.size
  context.beginPath()

  switch (petal.shapeType) {
    case 0:
      // 圓胖水滴形
      context.moveTo(0, 0)
      context.bezierCurveTo(s * 0.6, -s * 0.35, s * 1.1, s * 0.4, 0, s * 1.1)
      context.bezierCurveTo(-s * 1.1, s * 0.4, -s * 0.6, -s * 0.35, 0, 0)
      break
    case 1:
      // 細長橢圓形
      context.moveTo(0, 0)
      context.bezierCurveTo(s * 0.28, -s * 0.1, s * 0.32, s * 0.75, 0, s * 1.45)
      context.bezierCurveTo(-s * 0.32, s * 0.75, -s * 0.28, -s * 0.1, 0, 0)
      break
    case 2:
      // 頂端有缺口的櫻花花瓣
      context.moveTo(0, 0)
      context.bezierCurveTo(s * 0.7, -s * 0.15, s * 1.05, s * 0.45, s * 0.18, s * 1.05)
      context.quadraticCurveTo(s * 0.06, s * 0.88, 0, s * 0.95)
      context.quadraticCurveTo(-s * 0.06, s * 0.88, -s * 0.18, s * 1.05)
      context.bezierCurveTo(-s * 1.05, s * 0.45, -s * 0.7, -s * 0.15, 0, 0)
      break
    case 3:
      // 不對稱不規則形
      context.moveTo(0, 0)
      context.bezierCurveTo(s * 0.75, -s * 0.25, s * 0.95, s * 0.55, s * 0.1, s * 1.2)
      context.bezierCurveTo(-s * 0.4, s * 1.05, -s * 1.05, s * 0.35, 0, 0)
      break
  }

  context.fill()

  context.strokeStyle = 'rgba(255,255,255,0.3)'
  context.lineWidth = 0.7
  context.beginPath()
  context.moveTo(0, 0)
  context.lineTo(0, s * 0.85)
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

  petals = Array.from({ length: sakuraState.petalCount }, () =>
    createPetal(canvas, false)
  )

  // 花瓣數由 console 秘密指令（sakura / storm）調整
  watch(() => sakuraState.petalCount, (count) => {
    const currentCanvas = canvasRef.value
    if (!currentCanvas) return
    while (petals.length < count) petals.push(createPetal(currentCanvas, true))
    petals.length = Math.min(petals.length, count)
  })

  // 換配色（rainbow / requiem）時讓現有花瓣即時換色
  watch(() => sakuraState.colors, (colors) => {
    for (const petal of petals)
      petal.color = colors[Math.floor(Math.random() * colors.length)]
  })

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

    const delta = Math.min((now - lastTime) / 16.67, 3) * sakuraState.speedFactor
    lastTime = now

    currentCtx.clearRect(0, 0, currentCanvas.width, currentCanvas.height)

    for (const petal of petals) {
      drawPetal(currentCtx, petal)

      petal.swayAngle += petal.swaySpeed * delta
      const sway = Math.sin(petal.swayAngle) * petal.swayAmplitude
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
  petals = []
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
