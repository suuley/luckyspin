<template>
  <div class="reel">
    <div
      ref="innerEl"
      class="reel-inner"
      :class="{ 'is-spinning': isSpinning }"
      :style="{
        transform: `translateY(${offset}px)`,
        transition: isTransitioning
          ? `transform ${duration}ms cubic-bezier(0.12, 0.8, 0.3, 1)`
          : 'none'
      }"
    >
      <div
        v-for="(symbol, idx) in symbols"
        :key="idx"
        class="symbol"
        :class="{ highlighted: idx === highlightedIdx && !isSpinning }"
        @click="$emit('symbol-click', symbol)"
      >
        {{ symbol }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  symbols: { type: Array, required: true },
  offset: { type: Number, default: 0 },
  isTransitioning: { type: Boolean, default: false },
  isSpinning: { type: Boolean, default: false },
  duration: { type: Number, default: 2500 },
  highlightedIdx: { type: Number, default: 1 }
})

defineEmits(['symbol-click'])

// Expose the inner element so parent can force reflow
const innerEl = ref(null)
defineExpose({ innerEl })
</script>

<style scoped>
.reel {
  flex: 1;
  overflow: hidden;
  position: relative;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  height: 210px;
  mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
}

.reel-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  will-change: transform;
}

.reel-inner.is-spinning {
  filter: blur(1.5px) brightness(0.85);
}

.symbol {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  width: 100%;
  height: 70px;
  flex-shrink: 0;
  user-select: none;
  cursor: pointer;
  transition: transform 0.15s, filter 0.15s;
}

.symbol:hover {
  transform: scale(1.15);
  filter: brightness(1.3);
  z-index: 10;
}

.symbol.highlighted {
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.6));
  transform: scale(1.15);
  z-index: 10;
}

@media (max-width: 480px) {
  .reel { height: 210px; }
  .symbol { font-size: 28px; height: 70px; }
}
</style>