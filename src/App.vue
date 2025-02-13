<script setup>
import Header from './components/Header.vue';
import Form from './components/Form.vue';
import ToggleProactive from './components/toggle-proactive.vue' // ✅ 確保正確路徑
</script>

<template>
  <div>
    <Header />
    <main>
      <Form />
	  <ToggleProactive />
    </main>
  </div>
</template>

<style scoped>
main {
  padding: 20px;
  background-color: #DBB3B3;
}
</style>
