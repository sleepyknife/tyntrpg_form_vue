<template>
  <div class="pinball-wrapper">
    <div class="pinball-header">
      <div class="pinball-meta">
        <span class="pinball-score" aria-live="polite">分數：{{ displayScore }}</span>
        <span class="pinball-progress" aria-live="polite">
          貓貓蒐集：{{ collectedCats }} / {{ totalCats }}
        </span>
      </div>
      <button type="button" class="pinball-reset" @click="resetGame">
        重新開始
      </button>
    </div>

    <div class="pinball-board" role="application" aria-label="貓貓彈珠台遊戲區">
      <canvas
        ref="canvas"
        class="pinball-canvas"
        :width="boardWidth"
        :height="boardHeight"
      ></canvas>
      <div class="pinball-overlay" aria-live="polite">
        <p>{{ state.message }}</p>
      </div>
    </div>

    <div class="pinball-controls">
      <button
        type="button"
        class="pinball-control"
        @mousedown="setFlipper('left', true)"
        @mouseup="setFlipper('left', false)"
        @mouseleave="setFlipper('left', false)"
        @touchstart.prevent="setFlipper('left', true)"
        @touchend.prevent="setFlipper('left', false)"
      >
        左板 (←)
      </button>
      <button
        type="button"
        class="pinball-control pinball-launch"
        @click="launchBall"
      >
        發射 (Space)
      </button>
      <button
        type="button"
        class="pinball-control"
        @mousedown="setFlipper('right', true)"
        @mouseup="setFlipper('right', false)"
        @mouseleave="setFlipper('right', false)"
        @touchstart.prevent="setFlipper('right', true)"
        @touchend.prevent="setFlipper('right', false)"
      >
        右板 (→)
      </button>
    </div>

    <p class="pinball-hint">
      使用鍵盤方向鍵或點擊按鈕控制彈板，空白鍵可以發射彈珠。
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

type Flipper = {
  pivot: { x: number; y: number }
  length: number
  thickness: number
  restAngle: number
  activeAngle: number
  angle: number
  isActive: boolean
}

type Bumper = {
  x: number
  y: number
  radius: number
  bounce: number
  score: number
  flash: number
  color: string
}

type CatTarget = {
  x: number
  y: number
  radius: number
  collected: boolean
  pulse: number
}

const emit = defineEmits<{
  (e: 'update', payload: { collected: number; total: number; score: number }): void
  (e: 'completed'): void
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

const boardWidth = 360
const boardHeight = 520
const gravity = 0.28
const wallBounce = 0.88
const friction = 0.998

const ball = reactive({
  x: boardWidth - 40,
  y: boardHeight - 120,
  radius: 8,
  vx: 0,
  vy: 0,
  maxSpeed: 12,
  stuck: true,
})

const state = reactive({
  score: 0,
  message: '按下發射鍵開始蒐集貓貓！',
})

const leftFlipper = reactive<Flipper>({
  pivot: { x: 100, y: boardHeight - 80 },
  length: 120,
  thickness: 18,
  restAngle: -Math.PI * 0.32,
  activeAngle: -Math.PI * 0.9,
  angle: -Math.PI * 0.32,
  isActive: false,
})

const rightFlipper = reactive<Flipper>({
  pivot: { x: boardWidth - 100, y: boardHeight - 80 },
  length: 120,
  thickness: 18,
  restAngle: Math.PI + Math.PI * 0.32,
  activeAngle: Math.PI + Math.PI * 0.9,
  angle: Math.PI + Math.PI * 0.32,
  isActive: false,
})

const bumpers = reactive<Bumper[]>([
  { x: boardWidth * 0.5, y: 170, radius: 26, bounce: 1.35, score: 150, flash: 0, color: '#ffdd6f' },
  { x: boardWidth * 0.28, y: 230, radius: 20, bounce: 1.25, score: 90, flash: 0, color: '#71d99e' },
  { x: boardWidth * 0.72, y: 230, radius: 20, bounce: 1.25, score: 90, flash: 0, color: '#71d99e' },
  { x: boardWidth * 0.5, y: 290, radius: 18, bounce: 1.2, score: 60, flash: 0, color: '#7aa5ff' },
])

const cats = reactive<CatTarget[]>([
  { x: boardWidth * 0.18, y: 120, radius: 14, collected: false, pulse: 0 },
  { x: boardWidth * 0.5, y: 80, radius: 14, collected: false, pulse: 0 },
  { x: boardWidth * 0.82, y: 130, radius: 14, collected: false, pulse: 0 },
  { x: boardWidth * 0.32, y: 320, radius: 15, collected: false, pulse: 0 },
  { x: boardWidth * 0.68, y: 320, radius: 15, collected: false, pulse: 0 },
])

const collectedCats = computed(() => cats.filter((cat) => cat.collected).length)
const totalCats = computed(() => cats.length)
const displayScore = computed(() => state.score.toString().padStart(4, '0'))

let animationId: number | null = null

function resetBall(stick = true) {
  ball.x = boardWidth - 40
  ball.y = boardHeight - 120
  ball.vx = 0
  ball.vy = 0
  ball.stuck = stick
}

function resetGame() {
  state.score = 0
  state.message = '按下發射鍵開始蒐集貓貓！'
  cats.forEach((cat) => {
    cat.collected = false
    cat.pulse = 0
  })
  bumpers.forEach((bumper) => {
    bumper.flash = 0
  })
  resetBall(true)
  emitUpdate()
}

function launchBall() {
  if (!ctx) {
    return
  }
  if (!animationId) {
    startLoop()
  }
  if (!ball.stuck) {
    state.message = '使用左右彈板讓彈珠持續彈跳！'
    return
  }
  ball.stuck = false
  ball.vx = -3.8 - Math.random() * 1.4
  ball.vy = -9 - Math.random() * 1.4
  state.message = '使用左右彈板讓彈珠持續彈跳！'
}

function setFlipper(side: 'left' | 'right', active: boolean) {
  const flipper = side === 'left' ? leftFlipper : rightFlipper
  flipper.isActive = active
  if (active && ball.stuck && side === 'right') {
    // allow little nudge while preparing launch
    ball.y -= 2
  }
}

function startLoop() {
  cancelAnimationFrame(animationId ?? 0)
  animationId = requestAnimationFrame(step)
}

function step() {
  animationId = requestAnimationFrame(step)
  updateGame()
  drawGame()
}

function updateGame() {
  if (!ctx) return

  updateFlipper(leftFlipper)
  updateFlipper(rightFlipper)

  if (ball.stuck) {
    ball.x = boardWidth - 40
    ball.y = Math.max(boardHeight - 140, Math.min(boardHeight - 120, ball.y))
    return
  }

  ball.vy += gravity
  ball.x += ball.vx
  ball.y += ball.vy

  ball.vx *= friction
  ball.vy *= friction

  const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy)
  if (speed > ball.maxSpeed) {
    const scale = ball.maxSpeed / speed
    ball.vx *= scale
    ball.vy *= scale
  }

  handleWallCollisions()
  handleFlipperCollision(leftFlipper)
  handleFlipperCollision(rightFlipper)
  handleBumpers()
  handleCatTargets()

  if (ball.y - ball.radius > boardHeight + 40) {
    state.message = '彈珠掉落了，再發射一次吧！'
    resetBall(true)
  }
}

function updateFlipper(flipper: Flipper) {
  const target = flipper.isActive ? flipper.activeAngle : flipper.restAngle
  const diff = target - flipper.angle
  flipper.angle += diff * 0.28
}

function handleWallCollisions() {
  const leftWall = 22
  const rightWall = boardWidth - 22
  const topWall = 20

  if (ball.x - ball.radius < leftWall) {
    ball.x = leftWall + ball.radius
    ball.vx = Math.abs(ball.vx) * wallBounce
  } else if (ball.x + ball.radius > rightWall) {
    ball.x = rightWall - ball.radius
    ball.vx = -Math.abs(ball.vx) * wallBounce
  }

  if (ball.y - ball.radius < topWall) {
    ball.y = topWall + ball.radius
    ball.vy = Math.abs(ball.vy) * wallBounce
  }
}

function handleFlipperCollision(flipper: Flipper) {
  const endX = flipper.pivot.x + Math.cos(flipper.angle) * flipper.length
  const endY = flipper.pivot.y + Math.sin(flipper.angle) * flipper.length
  const dx = endX - flipper.pivot.x
  const dy = endY - flipper.pivot.y
  const lengthSq = dx * dx + dy * dy
  if (lengthSq === 0) return

  const tRaw = ((ball.x - flipper.pivot.x) * dx + (ball.y - flipper.pivot.y) * dy) / lengthSq
  const t = Math.max(0, Math.min(1, tRaw))
  const closestX = flipper.pivot.x + dx * t
  const closestY = flipper.pivot.y + dy * t
  const distX = ball.x - closestX
  const distY = ball.y - closestY
  const distance = Math.sqrt(distX * distX + distY * distY)
  const minDist = ball.radius + flipper.thickness * 0.5

  if (distance < minDist) {
    const normalX = distance === 0 ? -dy / Math.sqrt(lengthSq) : distX / distance
    const normalY = distance === 0 ? dx / Math.sqrt(lengthSq) : distY / distance
    ball.x = closestX + normalX * minDist
    ball.y = closestY + normalY * minDist

    const rel = ball.vx * normalX + ball.vy * normalY
    if (rel < 0) {
      ball.vx -= (1.8 + (flipper.isActive ? 0.6 : 0)) * rel * normalX
      ball.vy -= (1.8 + (flipper.isActive ? 0.6 : 0)) * rel * normalY
    }

    ball.vy -= 2.5
    ball.vx += flipper === leftFlipper ? 2.6 : -2.6
    state.score += flipper.isActive ? 45 : 20
  }
}

function handleBumpers() {
  for (const bumper of bumpers) {
    const dx = ball.x - bumper.x
    const dy = ball.y - bumper.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const minDist = ball.radius + bumper.radius
    if (distance < minDist) {
      const normalX = distance === 0 ? 0 : dx / distance
      const normalY = distance === 0 ? -1 : dy / distance
      ball.x = bumper.x + normalX * minDist
      ball.y = bumper.y + normalY * minDist
      const dot = ball.vx * normalX + ball.vy * normalY
      ball.vx -= 2 * dot * normalX
      ball.vy -= 2 * dot * normalY
      ball.vx *= bumper.bounce
      ball.vy *= bumper.bounce
      state.score += bumper.score
      bumper.flash = 12
    }
    if (bumper.flash > 0) {
      bumper.flash -= 1
    }
  }
}

function handleCatTargets() {
  for (const cat of cats) {
    if (cat.collected) {
      if (cat.pulse > 0) cat.pulse -= 1
      continue
    }
    const dx = ball.x - cat.x
    const dy = ball.y - cat.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const minDist = ball.radius + cat.radius
    if (distance < minDist) {
      cat.collected = true
      cat.pulse = 20
      state.score += 200
      emitUpdate()
      if (collectedCats.value === totalCats.value) {
        state.message = '貓貓蒐集完成！感謝你的守護！'
        emit('completed')
      } else {
        state.message = '貓貓被成功救出，再接再厲！'
      }
    }
  }
}

function drawGame() {
  if (!ctx) return

  ctx.clearRect(0, 0, boardWidth, boardHeight)
  drawBackground()
  drawWalls()
  drawLauncher()
  drawBumpers()
  drawCats()
  drawFlipper(leftFlipper)
  drawFlipper(rightFlipper)
  drawBall()
}

function drawBackground() {
  if (!ctx) return
  const gradient = ctx.createLinearGradient(0, 0, boardWidth, boardHeight)
  gradient.addColorStop(0, '#3a2452')
  gradient.addColorStop(1, '#1a1f3b')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, boardWidth, boardHeight)
}

function drawWalls() {
  if (!ctx) return
  ctx.strokeStyle = '#fbe6a2'
  ctx.lineWidth = 14
  ctx.lineCap = 'round'

  ctx.beginPath()
  ctx.moveTo(20, boardHeight - 20)
  ctx.lineTo(20, 20)
  ctx.lineTo(boardWidth - 20, 20)
  ctx.lineTo(boardWidth - 20, boardHeight - 150)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(20, boardHeight - 20)
  ctx.bezierCurveTo(80, boardHeight - 80, boardWidth - 80, boardHeight - 80, boardWidth - 20, boardHeight - 150)
  ctx.stroke()
}

function drawLauncher() {
  if (!ctx) return
  ctx.save()
  ctx.translate(boardWidth - 36, boardHeight - 140)
  ctx.fillStyle = '#2f3a5a'
  ctx.fillRect(-18, 0, 24, 140)
  ctx.fillStyle = '#fcd85a'
  ctx.fillRect(-12, 140 - (ball.stuck ? 40 : 20), 12, ball.stuck ? 40 : 20)
  ctx.restore()
}

function drawBumpers() {
  if (!ctx) return
  for (const bumper of bumpers) {
    ctx.save()
    ctx.beginPath()
    ctx.fillStyle = bumper.flash > 0 ? '#ffffff' : bumper.color
    ctx.shadowColor = '#ffe9a6'
    ctx.shadowBlur = bumper.flash > 0 ? 20 : 8
    ctx.arc(bumper.x, bumper.y, bumper.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

function drawCats() {
  if (!ctx) return
  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '22px "Noto Color Emoji", "Segoe UI Emoji", sans-serif'
  for (const cat of cats) {
    const alpha = cat.collected ? Math.max(0, cat.pulse / 20) : 1
    ctx.globalAlpha = alpha
    ctx.fillText(cat.collected ? '✨' : '🐱', cat.x, cat.y)
    if (!cat.collected) {
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
      ctx.lineWidth = 2
      ctx.arc(cat.x, cat.y, cat.radius, 0, Math.PI * 2)
      ctx.stroke()
    }
  }
  ctx.restore()
  ctx.globalAlpha = 1
}

function drawFlipper(flipper: Flipper) {
  if (!ctx) return
  ctx.save()
  ctx.translate(flipper.pivot.x, flipper.pivot.y)
  ctx.rotate(flipper.angle)
  ctx.fillStyle = flipper.isActive ? '#ff9f68' : '#ff6f61'
  ctx.strokeStyle = '#ffe0c2'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.beginPath()
  const radius = flipper.thickness / 2
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(0, -radius, flipper.length, flipper.thickness, radius)
  } else {
    ctx.moveTo(0, -radius)
    ctx.lineTo(flipper.length, -radius)
    ctx.lineTo(flipper.length, radius)
    ctx.lineTo(0, radius)
    ctx.closePath()
  }
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}

function drawBall() {
  if (!ctx) return
  ctx.save()
  ctx.beginPath()
  const gradient = ctx.createRadialGradient(ball.x - 3, ball.y - 3, 2, ball.x, ball.y, ball.radius)
  gradient.addColorStop(0, '#ffffff')
  gradient.addColorStop(1, '#ffd36b')
  ctx.fillStyle = gradient
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function emitUpdate() {
  emit('update', {
    collected: collectedCats.value,
    total: totalCats.value,
    score: state.score,
  })
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.code === 'ArrowLeft') {
    setFlipper('left', true)
  } else if (event.code === 'ArrowRight') {
    setFlipper('right', true)
  } else if (event.code === 'Space') {
    event.preventDefault()
    launchBall()
  }
}

function handleKeyUp(event: KeyboardEvent) {
  if (event.code === 'ArrowLeft') {
    setFlipper('left', false)
  } else if (event.code === 'ArrowRight') {
    setFlipper('right', false)
  }
}

watch(
  () => state.score,
  () => {
    emitUpdate()
  }
)

watch(collectedCats, () => {
  emitUpdate()
})

onMounted(async () => {
  await nextTick()
  const element = canvas.value
  if (!element) return
  ctx = element.getContext('2d')
  if (!ctx) return
  element.width = boardWidth
  element.height = boardHeight
  drawGame()
  emitUpdate()
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId ?? 0)
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
})
</script>

<style scoped lang="scss">
.pinball-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(14, 13, 30, 0.1);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(6px);
}

.pinball-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.pinball-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-weight: 600;
  color: #2b1d35;
}

.pinball-score {
  background: #ffe27a;
  padding: 6px 12px;
  border-radius: 999px;
  letter-spacing: 1px;
}

.pinball-progress {
  background: #f8d7ff;
  padding: 6px 12px;
  border-radius: 999px;
}

.pinball-reset {
  border: none;
  background: linear-gradient(135deg, #6b5bff, #b672ff);
  color: #fff;
  padding: 6px 16px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.pinball-reset:hover,
.pinball-reset:focus {
  transform: translateY(-1px);
  box-shadow: 0 6px 12px rgba(107, 91, 255, 0.25);
}

.pinball-board {
  position: relative;
}

.pinball-canvas {
  width: 100%;
  max-width: 360px;
  height: auto;
  display: block;
  margin: 0 auto;
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(26, 23, 46, 0.35);
}

.pinball-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  pointer-events: none;
  padding: 12px;
}

.pinball-overlay p {
  background: rgba(15, 20, 45, 0.72);
  color: #f6f3ff;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 14px;
  max-width: 80%;
  text-align: center;
}

.pinball-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.pinball-control {
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #261833;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.pinball-control:hover,
.pinball-control:focus {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(26, 23, 46, 0.2);
}

.pinball-launch {
  background: linear-gradient(135deg, #ffd85a, #ff9f43);
  color: #462010;
}

.pinball-hint {
  font-size: 13px;
  color: #3a2a4e;
  margin: 0;
  text-align: center;
}

@media (max-width: 480px) {
  .pinball-wrapper {
    padding: 12px;
  }

  .pinball-overlay p {
    font-size: 12px;
  }
}
</style>
