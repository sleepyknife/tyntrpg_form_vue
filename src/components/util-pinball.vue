<template>
  <canvas
    ref="canvasRef"
    class="pointer-events-none fixed left-0 top-0 z-[99999] h-screen w-screen"
  />

  <shot-vector-control
    @start="handleShotStart"
    @commit="handleShotCommit"
  />
</template>

<script setup lang="ts">
import type { ComponentProps } from 'vue-component-type-helpers'
import { useDevicePixelRatio, useElementBounding, useRafFn } from '@vueuse/core'
import Matter from 'matter-js'
import { isTruthy, pipe, tap } from 'remeda'
import { onMounted, reactive, useTemplateRef, watch } from 'vue'
import ShotVectorControl from './shot-vector-control.vue'
import { utilPinballStore } from './util-pinball-store'

type ShotVectorControlProps = ComponentProps<typeof ShotVectorControl>

// #region Props
interface Props {
  /** 重力加速度
   *
   * x, y 為加速度的方向，scale 為加速度的大小
   */
  gravity?: Matter.Gravity;
  ballRadius?: number;
}
// #endregion Props
const props = withDefaults(defineProps<Props>(), {
  ballRadius: 10,
  gravity: () => ({
    scale: 0.001,
    x: 0,
    y: 1,
  }),
})

const { pixelRatio } = useDevicePixelRatio()

const canvasRef = useTemplateRef('canvasRef')
const canvasBounding = reactive(
  useElementBounding(canvasRef),
)

const engine = Matter.Engine.create({
  gravity: props.gravity,
})
watch(() => props.gravity, (value) => {
  if (value) {
    engine.gravity = value
  }
}, {
  immediate: true,
  deep: true,
})

const runner = Matter.Runner.create()

const DRAGGABLE_FLAG = 0x0002

const MAX_SPEED = 20
const ball = pipe(
  Matter.Bodies.circle(0, 0, props.ballRadius, {
    friction: 0,
    restitution: 1,
    render: { fillStyle: '#34c6eb' },
    collisionFilter: { category: DRAGGABLE_FLAG },
    label: 'ball',
  }),
  tap((item) => {
    Matter.Composite.add(engine.world, item)

    Matter.Events.on(engine, 'beforeUpdate', () => {
      const { position, velocity } = ball
      // 限制球的最大速度
      const speed = Matter.Vector.magnitude(velocity)
      if (speed > MAX_SPEED) {
        const dir = Matter.Vector.normalise(velocity)
        Matter.Body.setVelocity(ball, Matter.Vector.mult(dir, MAX_SPEED))
      }

      // 避免球飛出畫面
      const { width, height } = canvasBounding
      const { ballRadius } = props
      let hitX = false
      let hitY = false

      let nx = position.x
      let ny = position.y
      if (position.x < ballRadius) {
        nx = ballRadius
        hitX = true
      }
      if (position.x > width - ballRadius) {
        nx = width - ballRadius
        hitX = true
      }
      if (position.y < ballRadius) {
        ny = ballRadius
        hitY = true
      }
      if (position.y > height - ballRadius) {
        ny = height - ballRadius
        hitY = true
      }

      if (hitX || hitY) {
        Matter.Body.setPosition(ball, { x: nx, y: ny })
        Matter.Body.setVelocity(ball, {
          x: hitX ? -velocity.x : velocity.x,
          y: hitY ? -velocity.y : velocity.y,
        })
      }
    })
  }),
)

async function initMechBodies() {
  const list = Array.from(utilPinballStore.mechMap)
    .map(([id, mech]) => {
      const { options } = mech

      if (options.type === 'bumper') {
        return Matter.Bodies.rectangle(
          mech.left + mech.width / 2,
          mech.top + mech.height / 2,
          mech.width,
          mech.height,
          {
            isStatic: true,
            restitution: 1,
            friction: 0,
            render: { visible: false },
            id,
            label: `bumper`,
            chamfer: {
              // 取最小值，避免形狀異常
              radius: Math.min(mech.width / 2, mech.height / 2, options.radius ?? 5),
            },
          },
        )
      }

      if (options.type === 'spinner') {
        return Matter.Bodies.rectangle(
          mech.left + mech.width / 2,
          mech.top + mech.height / 2,
          mech.width,
          mech.height,
          {
            isStatic: true,
            isSensor: true,
            render: { visible: false },
            id,
            label: `spinner`,
          },
        )
      }

      return undefined
    })
    .filter(isTruthy)

  Matter.Composite.add(engine.world, list)

  // 不斷同步 DOM 與對應 Body 位置
  useRafFn(() => {
    Array.from(utilPinballStore.mechMap).forEach(([id, mech]) => {
      const target = list.find((item) => item.id === id)

      if (!target) {
        return
      }

      Matter.Body.setPosition(target, {
        x: mech.left + mech.width / 2,
        y: mech.top + mech.height / 2,
      })
    })
  })
}

let render: Matter.Render | undefined
watch(pixelRatio, (value) => {
  if (!render) {
    return
  }

  Matter.Render.setPixelRatio(render, value)
}, { immediate: true })

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) {
    return
  }

  // Randomize initial position
  const padding = 50; // 50px padding from edges
  const randomX = padding + Math.random() * (canvasBounding.width - padding * 2);
  const randomY = padding + Math.random() * (canvasBounding.height - padding * 2);

  Matter.Body.setPosition(ball, {
    x: randomX,
    y: randomY,
  })

  // 處理各個 mech 邏輯
  Matter.Events.on(engine, 'collisionStart', (evt) => {
    for (const pair of evt.pairs) {
      const { bodyA, bodyB } = pair

      // 只有 ball 與 mech 會有碰撞事件
      const mechBody = bodyA === ball ? bodyB : bodyA
      if (mechBody.label === 'spinner') {
        utilPinballStore.updateStatus(mechBody.id, {
          isColliding: true,
        })
      }
    }
  })
  Matter.Events.on(engine, 'collisionEnd', (evt) => {
    for (const pair of evt.pairs) {
      const { bodyA, bodyB } = pair

      // 只有 ball 與 mech 會有碰撞事件
      const mechBody = bodyA === ball ? bodyB : bodyA
      if (mechBody.label === 'bumper') {
        const { velocity } = ball

        utilPinballStore.updateStatus(mechBody.id, {
          isColliding: true,
        })

        // 拉到最大速度
        const newVelocity = Matter.Vector.mult(velocity, 99999)
        Matter.Body.setVelocity(ball, newVelocity)
      }
    }
  })

  const { width, height } = canvasBounding
  render = Matter.Render.create({
    canvas,
    engine,
    bounds: {
      min: { x: 0, y: 0 },
      max: { x: width, y: height },
    },
    options: {
      width,
      height,
      background: 'transparent',
      wireframeBackground: 'transparent',
      wireframes: true,
    },
  })

  Matter.Render.run(render)
  Matter.Runner.run(runner, engine)

  initMechBodies()
})

function handleShotStart() {
  Matter.Body.setStatic(ball, true)
}
const handleShotCommit: ShotVectorControlProps['onCommit'] = ({
  direction,
  length,
}: {
  direction: { x: number; y: number };
  length: number;
}) => {
  Matter.Body.setStatic(ball, false)

  const forceMagnitude = Math.min(length / 5000, 0.05)
  const force = Matter.Vector.mult(direction, forceMagnitude)

  Matter.Body.applyForce(ball, ball.position, force)
}
</script>

<style scoped lang="sass">
</style>
