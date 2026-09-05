<template>
  <div class="controls">
    <div class="bet-controls">
      <button class="bet-btn" @click="adjustBet(-step)" :disabled="isSpinning || bet <= 0.05">−</button>
      <div class="bet-display">
        <span class="bet-label">BET</span>
        <span class="bet-amount">${{ bet.toFixed(2) }}</span>
      </div>
      <button class="bet-btn" @click="adjustBet(step)" :disabled="isSpinning || bet >= 10">+</button>
    </div>

    <div class="quick-bets">
      <button
        v-for="amount in quickBetAmounts"
        :key="amount"
        class="quick-bet-btn"
        :class="{ active: bet === amount }"
        @click="$emit('update:bet', amount)"
        :disabled="isSpinning"
      >
        ${{ amount.toFixed(2) }}
      </button>
    </div>

    <button class="spin-btn" @click="$emit('spin')" :disabled="isSpinning">
      <span v-if="!isSpinning">🎲 RANDOM SPIN</span>
      <span v-else>SPINNING...</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  bet: { type: Number, required: true },
  isSpinning: { type: Boolean, default: false }
})

const emit = defineEmits(['update:bet', 'spin'])

const step = computed(() => {
  if (props.bet < 1) return 0.05
  if (props.bet < 5) return 0.25
  return 0.5
})

const quickBetAmounts = [0.05, 0.25, 0.5, 1, 2.5, 5, 10]

const adjustBet = (amount) => {
  const n = Math.round((props.bet + amount) * 100) / 100
  if (n >= 0.05 && n <= 10) emit('update:bet', n)
}
</script>

<style scoped>
.controls {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bet-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  padding: 8px 16px;
}

.bet-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 215, 0, 0.1);
  color: #ffd700;
  font-size: 24px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.bet-btn:hover:not(:disabled) { background: rgba(255, 215, 0, 0.2); }
.bet-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.bet-display { text-align: center; flex: 1; }
.bet-label { font-size: 10px; color: #8888aa; text-transform: uppercase; display: block; }
.bet-amount { font-size: 24px; font-weight: 700; color: white; }

.quick-bets { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; }
.quick-bet-btn {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.03);
  color: #8888aa;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-bet-btn:hover:not(:disabled) { background: rgba(255, 255, 255, 0.05); color: white; }
.quick-bet-btn.active {
  background: rgba(255, 215, 0, 0.15);
  border-color: rgba(255, 215, 0, 0.3);
  color: #ffd700;
}
.quick-bet-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.spin-btn {
  width: 100%;
  padding: 18px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #ffd700, #ff6b35);
  color: #0a0a1a;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
  text-transform: uppercase;
}

.spin-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(255, 215, 0, 0.4);
}
.spin-btn:active:not(:disabled) { transform: scale(0.98); }
.spin-btn:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 480px) {
  .bet-btn { width: 36px; height: 36px; font-size: 20px; }
  .bet-amount { font-size: 20px; }
  .spin-btn { padding: 14px; font-size: 16px; }
}
</style>