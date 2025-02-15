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
}

body {
  background-color: #DBB3B3;
}
</style>
