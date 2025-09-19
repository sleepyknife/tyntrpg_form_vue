import type { MechOptions } from './util-pinball-store'
import { useElementBounding, useRafFn } from '@vueuse/core'
import anime from 'animejs'
import { clone, defaultTo, isString, pipe, when } from 'remeda'
import { type Directive, effectScope, reactive, watch } from 'vue'
import { utilPinballStore as store } from './util-pinball-store'

const defaultOptions: MechOptions = {
  type: 'bumper',
}

/** 儲存前後文，將 mounted 資訊傳遞至 unmounted */
const ctxMap = new WeakMap<HTMLElement, {
  cleanup: () => void;
}>()

/** @default 'bumper' */
export const vPinballMech: Directive<
  any,
  MechOptions | MechOptions['type'] | undefined
> = {
  mounted(el, binding) {
    if (!(el instanceof HTMLElement)) {
      return
    }

    const scope = effectScope()

    scope.run(() => {
      const bounding = reactive(useElementBounding(el))

      const options = pipe(
        binding.value,
        when(
          isString,
          (type) => ({ type: type as MechOptions['type'] }),
        ),
        defaultTo(clone(defaultOptions)),
      )

      const id = store.add({
        options,
        ...bounding,
        status: {
          isColliding: false,
        },
      })

      // 加上 CSS 透視
      if (options.type === 'spinner') {
        el.parentElement?.style.setProperty('transformStyle', 'preserve-3d')
        el.parentElement?.style.setProperty('perspective', '400px')
      }

      if (['spinner', 'bumper'].includes(options.type)) {
        // 為了讓 transform 有效果，需調整 display
        if (getComputedStyle(el).display === 'inline') {
          el.style.display = 'inline-block'
        }
      }

      watch(bounding, (value) => {
        store.update(id, value)
      }, { deep: true })

      useRafFn(() => {
        // 檢查元素是否還在 DOM 中，否則停止 effect scope
        if (!el.isConnected) {
          scope.stop()
          return
        }
        // console.log(`🚀 ~ useRafFn:`)

        const mech = store.get(id)
        const status = mech?.status
        if (!status?.isColliding) {
          return
        }

        status.isColliding = false

        if (mech?.options.type === 'bumper') {
          anime({
            targets: el,
            scale: [
              { value: 1.2, duration: 0, easing: 'easeOutQuad' },
              { value: 1, duration: 800, easing: 'easeOutElastic(1, .5)' },
            ],
          })
        }

        if (mech?.options.type === 'spinner') {
          const targetRotateX = pipe(
            Number.parseInt(`${anime.get(el, 'rotateX')}`),
            (value) => 360 - (value % 360) + 360,
          )
          anime({
            targets: el,
            rotateX: [
              { value: `+=${targetRotateX}`, duration: 800, easing: 'easeOutQuad' },
            ],
          })
        }
      }, {
        fpsLimit: 20,
      })

      // ctxMap.set(el, {
      //   cleanup() {
      //     console.log(`[cleanup]`)
      //     scope.stop()
      //   },
      // })
    })
  },
  // 不知道為甚麼即使 cleanup() 有執行（[cleanup] 有出現），還是沒有停止 useRafFn
  // beforeUnmount(el) {
  //   const ctx = ctxMap.get(el)
  //   if (ctx) {
  //     ctx.cleanup()
  //     ctxMap.delete(el)
  //   }
  // },
}
