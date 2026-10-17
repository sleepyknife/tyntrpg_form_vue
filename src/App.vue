<script setup>
import Header from './components/Header.vue';
import Form from './components/Form.vue';
import Pending from './components/Pending.vue';
import Close from './components/Close.vue';
import SakuraFubuki from './components/SakuraFubuki.vue';

import { ref, onMounted } from "vue";
import { registerSecretConsole } from './composables/secret-console';

const Phase = ref("");

// 🔥 JOJO 貓貓警告 Console 函數
function showJojoCatConsole() {
  setTimeout(() => {
	  
	const asciiCat = [
  " ,_     _",
  " |\\_,-~/",
  " / _  _ |    ,--.    「你…為什麼打開了 Console？」",
  "(  @  @ )   / ,-'    「明明知道那裡是騙人的陷阱…」",
  " \\  _T_/-._( (",
  " /         `. \\      ゴ",
  "|         _  \\ |      ゴ",
  " \\ \\ ,  /      |      ゴ",
  "  || |-_\__   /          ゴ",        
  " ((_/`(____,-'            ゴ…"
].join('\n');


    const phrase1 = '「你…並沒有選擇逃跑…」';
    const phrase2 = '「居然…不是後退，而是朝我走來嗎？」';
    const phrase3 = '「開發者的領域，只屬於有覺悟之人。」';
    const standName = '★ 替身名：FURTISSIMO（毛奏極限）';

    console.log('%c⚠️ 住手，開發者！', 'font-size: 40px; color: #b300b3; font-weight: bold;');
    console.log('%c你正對上了不該接觸的替身。', 'font-size: 18px; color: #ff66cc; font-style: italic;');
    console.log('%c這裡不是輸入神祕程式碼的地方，這是命運的戰場。', 'font-size: 14px; color: orange;');
    console.log('%c' + phrase1, 'color: #999; font-size: 14px;');
    console.log('%c' + phrase2, 'color: #fff; font-size: 16px; font-weight: bold;');
    console.log('%c' + phrase3, 'color: #ff9999; font-size: 14px; font-style: italic;');
    console.log('%c' + standName, 'color: cyan; font-size: 13px;');
    console.log('%c參考：https://trpgintaoyuan.weebly.com\n', 'font-size: 12px; color: blue; text-decoration: underline;');
    console.log('%c' + asciiCat, 'font-family: monospace; color: #993299; font-size: 13px; font-weight: bold;');
    console.log('%c「…不過，既然你都走到這裡了。」', 'color: #999; font-size: 14px; font-style: italic;');
    console.log('%c輸入 help() ，我告訴你這裡能做什麼。', 'font-size: 16px; color: #01814A; font-weight: bold;');
  }, 1000);
}

onMounted(() => {

  // 讀取 env.json（單獨的 async 函數）
  loadEnvData();
  
  // 註冊 console 秘密指令（help / ora / sakura …）
  registerSecretConsole();

  // 顯示 JOJO 貓貓 Console 警告
  showJojoCatConsole();
})

async function loadEnvData() {
  try {
	  fetch(`${import.meta.env.BASE_URL}env.json`)
		  .then(response => response.json())
		  .then(data => {
			console.log('📦 JSON Data:', data);
			Phase.value = data.Phase; // Get phase
		  })
		  .catch(error => console.error('❌ Failed to load env.json:', error));

	
	console.log("Phase after fetch:", Phase.value); // ✅ 確保在資料加載後印出
  } catch (error) {
    console.error("Error loading env.json:", error);
  }
}



</script>

<template>
  <div>
    <SakuraFubuki />
    <main>
	  <div v-if="Phase === 'Form'"><Form /></div>
	  <div v-else-if="Phase === 'Pending'"><Pending /></div>
	  <div v-else-if="Phase === 'Close'"><Close /></div>
    </main>
  </div>
</template>

<style>
main {
  padding: 20px;
  background-color: #DBB3B3;
  color: black;
}

body {
  background-color: #DBB3B3;
}

/* ───────── 以下為 console 秘密指令用的特效 ───────── */

/* zawa() ── ゴ ゴ ゴ 的顫抖 */
body.secret-zawa main {
  animation: secret-zawa-shake 0.12s infinite;
}
@keyframes secret-zawa-shake {
  0%   { transform: translate(0, 0); }
  25%  { transform: translate(-2px, 1px); }
  50%  { transform: translate(2px, -1px); }
  75%  { transform: translate(-1px, -2px); }
  100% { transform: translate(1px, 2px); }
}

/* rainbow() ── 標題跟著跑彩虹 */
body.secret-rainbow .card-header {
  background: linear-gradient(90deg, #FF5E5E, #FFA45E, #FFE45E, #7BE85E, #5EC8FF, #8A5EFF, #FF5ED8, #FF5E5E);
  background-size: 400% 100%;
  animation: secret-rainbow-slide 6s linear infinite;
}
@keyframes secret-rainbow-slide {
  from { background-position: 0% 50%; }
  to   { background-position: 400% 50%; }
}

/* requiem() ── 全解鎖後的金色鎮魂曲 */
body.secret-requiem main {
  filter: sepia(0.35) saturate(1.2);
  transition: filter 1.2s ease;
}
body.secret-requiem .card-header {
  background: #8a6d1f;
  box-shadow: 0 0 24px rgba(212, 160, 23, 0.75);
}

/* 使用者若偏好減少動態效果，就別抖也別跑 */
@media (prefers-reduced-motion: reduce) {
  body.secret-zawa main,
  body.secret-rainbow .card-header {
    animation: none;
  }
}
</style>
