import { reactive } from 'vue'

/** 櫻花預設值，reset() 時用來還原 */
export const SAKURA_DEFAULTS = {
  petalCount: 55,
  speedFactor: 1,
  colors: ['#FFB7C5', '#FFC4CE', '#FF8FAB', '#FFD6DD', '#FFA3B5', '#FFCCD4'],
} as const

export const RAINBOW_COLORS = [
  '#FF5E5E', '#FFA45E', '#FFE45E', '#7BE85E', '#5EC8FF', '#8A5EFF', '#FF5ED8',
]

export const REQUIEM_COLORS = [
  '#FFD700', '#FFE98A', '#F5C542', '#FFF3C4', '#E8B92E',
]

/** 櫻花特效的共享狀態，由 console 秘密指令操控 */
export const sakuraState = reactive({
  petalCount: SAKURA_DEFAULTS.petalCount as number,
  speedFactor: SAKURA_DEFAULTS.speedFactor as number,
  colors: [...SAKURA_DEFAULTS.colors] as string[],
})

export function setPetalCount(count: number) {
  sakuraState.petalCount = Math.max(0, Math.min(999, Math.floor(count)))
}

export function setPalette(colors: readonly string[]) {
  sakuraState.colors = [...colors]
}

export function resetSakura() {
  sakuraState.petalCount = SAKURA_DEFAULTS.petalCount
  sakuraState.speedFactor = SAKURA_DEFAULTS.speedFactor
  sakuraState.colors = [...SAKURA_DEFAULTS.colors]
}

/** 表單標題既有的貓耳（wrapper-cat-ear）動作，由 catEars() 操控 */
export type CatEarAction = 'peekaboo' | 'relaxed' | 'fear' | 'displeased' | 'shake'
export const CAT_EAR_ACTIONS: CatEarAction[] = ['peekaboo', 'relaxed', 'fear', 'displeased', 'shake']

export const catEarState = reactive({
  action: 'relaxed' as CatEarAction,
})

/** 加在 <body> 上的特效 class，純 CSS 控制 */
export const BODY_CLASS = {
  rainbow: 'secret-rainbow',
  zawa: 'secret-zawa',
  requiem: 'secret-requiem',
} as const

export function toggleBodyClass(name: string, force?: boolean) {
  return document.body.classList.toggle(name, force)
}
