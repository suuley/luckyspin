<template>
  <div class="page">
    <SlotMachine />
  </div>
</template>

<script setup>
import SlotMachine from './components/SlotMachine.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

body {
  background: #0a0a1a;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.page {
  width: 100%;
  max-width: 500px;
}
</style>