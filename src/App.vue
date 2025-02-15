<script setup>
import Header from './components/Header.vue';
import Form from './components/Form.vue';
import Pending from './components/Pending.vue';
import Close from './components/Close.vue';

import { ref, onMounted } from "vue";

const Phase = ref("");

onMounted(() => {

  // 讀取 env.json（單獨的 async 函數）
  loadEnvData();
})

async function loadEnvData() {
  try {
    const baseUrl = import.meta.env.BASE_URL; // 取得專案的根路徑
    const response = await fetch(`${baseUrl}env.json`); // ✅ 正確取得 env.json
    if (!response.ok) {
      throw new Error("Failed to fetch env.json");
    }
    const data = await response.json();
    Phase.value = data.Phase; // Get phase
	
	console.log("Phase after fetch:", Phase.value); // ✅ 確保在資料加載後印出
  } catch (error) {
    console.error("Error loading env.json:", error);
  }
}

</script>

<template>
  <div>
    <main>
	  <div v-if="Phase === 'Open'"><Form /></div>
	  <div v-else-if="Phase === 'Pending'"><Pending /></div>
	  <div v-else-if="Phase === 'Close'"><Close /></div>
    </main>
  </div>
</template>

<style>
main {
  padding: 20px;
  background-color: #DBB3B3;
}

body {
  background-color: #DBB3B3;
}
</style>
