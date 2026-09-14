import type { CatEarAction } from './secret-effects'
import {
  BODY_CLASS,
  CAT_EAR_ACTIONS,
  catEarState,
  RAINBOW_COLORS,
  REQUIEM_COLORS,
  SAKURA_DEFAULTS,
  resetSakura,
  sakuraState,
  setPalette,
  setPetalCount,
  toggleBodyClass,
} from './secret-effects'

const STORAGE_KEY = 'tyn:stand-log'
const READY_FLAG = '__tynSecretConsoleReady'

/** 會計入「替身覺醒進度」的指令，全部用過就解鎖 requiem() */
const TRACKED = ['ora', 'stand', 'zawa', 'sakura', 'storm', 'catEars', 'rainbow'] as const
type TrackedName = typeof TRACKED[number]

interface CommandSpec {
  signature: string
  description: string
  /** 解鎖前不顯示在 help() 裡 */
  hidden?: boolean
}

const COMMANDS: Record<string, CommandSpec> = {
  ora: { signature: 'ora(n?)', description: '歐拉連打，n 為次數（1〜50）' },
  stand: { signature: 'stand()', description: '鑑定你的替身能力值' },
  zawa: { signature: 'zawa()', description: 'ゴ ゴ ゴ… 畫面會開始顫抖' },
  sakura: { signature: 'sakura(n)', description: '指定櫻花花瓣數量（0〜999）' },
  storm: { signature: 'storm()', description: '櫻花暴風，再打一次關掉' },
  catEars: { signature: 'catEars(action?)', description: `操控標題那對貓耳：${CAT_EAR_ACTIONS.join(' / ')}` },
  rainbow: { signature: 'rainbow()', description: '花瓣彩虹化，再打一次還原' },
  achievements: { signature: 'achievements()', description: '查看替身覺醒進度' },
  reset: { signature: 'reset()', description: '把所有特效恢復原狀' },
  help: { signature: 'help()', description: '再看一次這張表' },
  requiem: { signature: 'requiem()', description: '★ 鎮魂曲 — 唯有走完全部道路者可用', hidden: true },
}

const S = {
  title: 'color: #b300b3; font-size: 20px; font-weight: bold;',
  line: 'color: #333; font-size: 13px;',
  cmd: 'color: #01814A; font-size: 13px; font-weight: bold;',
  desc: 'color: #777; font-size: 12px;',
  hit: 'color: #ff66cc; font-size: 15px; font-weight: bold;',
  quote: 'color: #999; font-size: 13px; font-style: italic;',
  gold: 'color: #d4a017; font-size: 16px; font-weight: bold;',
}

function loadLog(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set<string>(raw ? JSON.parse(raw) : [])
  }
  catch {
    return new Set<string>()
  }
}

function saveLog(log: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...log]))
  }
  catch {
    // 無痕模式之類，記不住就算了
  }
}

const used = loadLog()

function isAwakened() {
  return TRACKED.every(name => used.has(name))
}

function mark(name: TrackedName) {
  if (used.has(name))
    return
  const wasAwakened = isAwakened()
  used.add(name)
  saveLog(used)
  if (!wasAwakened && isAwakened())
    announceAwakening()
  else
    console.log(`%c… 替身覺醒進度 ${used.size}/${TRACKED.length}（achievements() 可查看）`, S.desc)
}

function announceAwakening() {
  console.log('%c★ 替身覺醒 — FURTISSIMO REQUIEM', S.gold)
  console.log('%c「你走完了全部的道路。連我也沒想到有人會做到這一步。」', S.quote)
  console.log('%c解鎖新指令：%crequiem()', S.line, S.cmd)
}

function ora(times = 5) {
  mark('ora')
  const n = Math.max(1, Math.min(50, Math.floor(times) || 5))
  const rows: string[] = []
  for (let i = 0; i < n; i += 5)
    rows.push(Array.from({ length: Math.min(5, n - i) }, () => 'ORA').join('　'))
  console.log(`%c${rows.join('\n')}`, S.hit)
  console.log(`%c「歐拉了 ${n} 次。手感不錯吧？」`, S.quote)
  return undefined
}

const STAND_NAMES = [
  'FURTISSIMO（毛奏極限）',
  'SAKURA STORM（櫻花吹雪）',
  'FORM SUBMIT（表單提出）',
  'NEKO MIMI（貓耳）',
  'CONSOLE LOG（除錯之聲）',
  'D20 CRITICAL（大成功）',
]

function randomRank() {
  return ['A', 'B', 'C', 'D', 'E'][Math.floor(Math.random() * 5)]
}

function stand() {
  mark('stand')
  const name = STAND_NAMES[Math.floor(Math.random() * STAND_NAMES.length)]
  console.log(`%c★ 替身名：${name}`, S.hit)
  console.table({
    破壞力: randomRank(),
    速度: randomRank(),
    射程距離: randomRank(),
    持續力: randomRank(),
    精密動作性: randomRank(),
    成長性: randomRank(),
  })
  console.log('%c「能力值是每次鑑定都會變的。命運本來就不固定。」', S.quote)
  return undefined
}

function zawa() {
  mark('zawa')
  toggleBodyClass(BODY_CLASS.zawa, true)
  const beats = ['ゴ', 'ゴ　ゴ', 'ゴ　ゴ　ゴ', 'ゴ　ゴ　ゴ　ゴ…']
  beats.forEach((beat, i) => {
    setTimeout(() => console.log(`%c${beat}`, `color:#993299; font-size:${16 + i * 6}px; font-weight:bold;`), i * 450)
  })
  setTimeout(() => {
    toggleBodyClass(BODY_CLASS.zawa, false)
    console.log('%c「…空氣安靜下來了。這次放過你。」', S.quote)
  }, 2600)
  return undefined
}

function sakura(count?: number) {
  mark('sakura')
  if (typeof count !== 'number' || Number.isNaN(count)) {
    console.log(`%c目前花瓣數：${sakuraState.petalCount}（用 sakura(200) 這樣指定，上限 999）`, S.line)
    return undefined
  }
  setPetalCount(count)
  console.log(`%c花瓣數已設為 ${sakuraState.petalCount}`, S.line)
  if (sakuraState.petalCount >= 900)
    console.log('%c「這種量…已經不是賞花，是雪崩了。」', S.quote)
  return undefined
}

let stormOn = false
function storm() {
  mark('storm')
  stormOn = !stormOn
  if (stormOn) {
    setPetalCount(320)
    sakuraState.speedFactor = 3.5
    console.log('%c櫻花暴風・開始', S.hit)
    console.log('%c「站穩了，開發者。」', S.quote)
  }
  else {
    setPetalCount(SAKURA_DEFAULTS.petalCount)
    sakuraState.speedFactor = SAKURA_DEFAULTS.speedFactor
    console.log('%c風停了。', S.line)
  }
  return undefined
}

const CAT_EAR_LINES: Record<CatEarAction, string> = {
  peekaboo: '「…我沒有在躲。只是剛好蹲在這裡。」',
  relaxed: '「耳朵放下來了。這代表我暫時信任你。」',
  fear: '「什、什麼東西！？剛剛那個 console.error 是什麼！？」',
  displeased: '「飛機耳。你知道這代表什麼吧。」',
  shake: '「喵。…不對，剛剛那不是我叫的。」',
}

function catEars(action?: CatEarAction) {
  mark('catEars')
  // 三個頁面的標題本來就有貓耳元件，這裡直接改它的動作
  if (action && !CAT_EAR_ACTIONS.includes(action)) {
    console.log(`%c沒有這個動作。可用：${CAT_EAR_ACTIONS.join(' / ')}`, S.line)
    return undefined
  }
  const next: CatEarAction = action ?? (catEarState.action === 'relaxed' ? 'shake' : 'relaxed')
  catEarState.action = next
  console.log(`%c貓耳動作：${next}`, S.line)
  console.log(`%c${CAT_EAR_LINES[next]}`, S.quote)
  return undefined
}

let rainbowOn = false
function rainbow() {
  mark('rainbow')
  rainbowOn = !rainbowOn
  setPalette(rainbowOn ? RAINBOW_COLORS : SAKURA_DEFAULTS.colors)
  toggleBodyClass(BODY_CLASS.rainbow, rainbowOn)
  console.log(rainbowOn ? '%c花瓣彩虹化。' : '%c花瓣變回櫻色。', S.line)
  return undefined
}

function achievements() {
  const rows = TRACKED.map(name => ({
    指令: COMMANDS[name].signature,
    狀態: used.has(name) ? '✔ 已試過' : '— 還沒',
  }))
  console.log(`%c替身覺醒進度 ${used.size}/${TRACKED.length}`, S.title)
  console.table(rows)
  if (isAwakened())
    console.log('%c全部解鎖。requiem() 已可使用。', S.gold)
  else
    console.log('%c「還有沒走過的路。別急，時間站在你這邊。」', S.quote)
  return undefined
}

function reset() {
  resetSakura()
  stormOn = false
  rainbowOn = false
  Object.values(BODY_CLASS).forEach(cls => toggleBodyClass(cls, false))
  catEarState.action = 'relaxed'
  console.log('%c所有特效已恢復原狀。（覺醒進度不會消失）', S.line)
  return undefined
}

function requiem() {
  if (!isAwakened()) {
    console.log('%c「你還沒有那個覺悟。」', S.quote)
    console.log('%c先把 achievements() 裡的指令都試過一輪。', S.desc)
    return undefined
  }
  setPalette(REQUIEM_COLORS)
  setPetalCount(180)
  sakuraState.speedFactor = 0.25
  toggleBodyClass(BODY_CLASS.requiem, true)
  console.log('%c★ FURTISSIMO REQUIEM — 發動', S.gold)
  console.log('%c「鎮魂曲的能力，是讓一切慢下來。」', S.quote)
  console.log('%c「包括你填表單的手。…開玩笑的，快去報名。」', S.quote)
  console.log('%c（reset() 可以解除）', S.desc)
  return undefined
}

function help() {
  console.log('%c☰ 隱藏指令表', S.title)
  Object.entries(COMMANDS).forEach(([name, spec]) => {
    if (spec.hidden && !isAwakened())
      return
    const done = TRACKED.includes(name as TrackedName) && used.has(name) ? ' ✔' : ''
    console.log(`%c  ${spec.signature}%c  ${spec.description}${done}`, S.cmd, S.desc)
  })
  console.log(`%c覺醒進度 ${used.size}/${TRACKED.length}　—　全部試過會發生一點事。`, S.desc)
  return undefined
}

/** 把秘密指令掛上 window，只會註冊一次 */
export function registerSecretConsole() {
  const w = window as unknown as Record<string, unknown>
  if (w[READY_FLAG])
    return
  w[READY_FLAG] = true

  const api = {
    ora,
    stand,
    zawa,
    sakura,
    storm,
    catEars,
    rainbow,
    achievements,
    reset,
    requiem,
    help,
  }

  Object.assign(w, api)
  w.$tyn = api
}
