<template>
  <div class="app-container" :class="{ 'big-win-flash': lastWin >= 50 }">
    <!-- Header -->
    <header class="header">
      <div class="logo">
        <span class="logo-icon">🎰</span>
        <span class="logo-text">LUCKY SPIN</span>
      </div>

      <div class="balance-display">
        <span class="balance-label">Balance</span>
        <span class="balance-amount">${{ balance.toFixed(2) }}</span>
      </div>
    </header>

    <!-- Slot Machine -->
    <div class="slot-machine">
      <div class="hint-text">💡 Click any symbol to spin all reels!</div>

      <div class="machine-frame">
        <div class="reels-container">

          <Reel
            ref="reel1"
            :symbols="reel1Strip"
            :offset="reel1Offset"
            :is-transitioning="reel1Transition"
            :is-spinning="reel1Spinning"
            :duration="reel1Duration"
            :highlighted-idx="1"
            @symbol-click="(s) => handleClick(1, s)"
          />

          <Reel
            ref="reel2"
            :symbols="reel2Strip"
            :offset="reel2Offset"
            :is-transitioning="reel2Transition"
            :is-spinning="reel2Spinning"
            :duration="reel2Duration"
            :highlighted-idx="1"
            @symbol-click="(s) => handleClick(2, s)"
          />

          <Reel
            ref="reel3"
            :symbols="reel3Strip"
            :offset="reel3Offset"
            :is-transitioning="reel3Transition"
            :is-spinning="reel3Spinning"
            :duration="reel3Duration"
            :highlighted-idx="1"
            @symbol-click="(s) => handleClick(3, s)"
          />

        </div>

        <div class="payline-center"></div>
      </div>
    </div>

    <!-- Controls -->
    <Controls
      :bet="bet"
      :is-spinning="isSpinning"
      @update:bet="(v) => (bet = v)"
      @spin="handleRandomSpin"
    />

    <!-- Win Display -->
    <div
      v-if="lastWin > 0"
      class="win-display"
      :class="{ 'big-win': lastWin >= 50 }"
    >
      🎉 WIN ${{ lastWin.toFixed(2) }} 🎉
    </div>

    <!-- Confetti -->
    <Confetti
      :show="showConfetti"
      :amount="lastWin"
      @done="showConfetti = false"
    />
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import Reel from './Reel.vue'
import Controls from './Controls.vue'
import Confetti from './Confetti.vue'
import { useAudio } from '../composables/useAudio.js'

const { playSpin, stopSpin, playWin, playClick } = useAudio()

// ============================================================
// STATE
// ============================================================

const balance = ref(10.0)
const bet = ref(1.0)
const lastWin = ref(0)
const isSpinning = ref(false)
const showConfetti = ref(false)

const SYMBOLS = [
  '🍒',
  '🍋',
  '🍊',
  '🍇',
  '🔔',
  '💎',
  '7️⃣',
  '⭐'
]

const SYMBOL_HEIGHT = 70
const FILLER_COUNT = 50
const SCROLL_ITEMS = 40

// ============================================================
// WEIGHTED SYMBOL DISTRIBUTION
//
// Total weight = 107
//
// 🍒 = 30/107
// 🍋 = 25/107
// 🍊 = 20/107
// 🍇 = 15/107
// 🔔 = 10/107
// 7️⃣ =  4/107
// 💎 =  2/107
// ⭐ =  1/107
//
// These probabilities are used for EVERY mathematical outcome.
// ============================================================

const SYMBOL_WEIGHTS = {
  '🍒': 30,
  '🍋': 25,
  '🍊': 20,
  '🍇': 15,
  '🔔': 10,
  '7️⃣': 4,
  '💎': 2,
  '⭐': 1
}

const TOTAL_WEIGHT = Object.values(SYMBOL_WEIGHTS)
  .reduce((sum, weight) => sum + weight, 0)

// ============================================================
// WEIGHTED RANDOM
// ============================================================

const weightedRandom = () => {
  let random = Math.random() * TOTAL_WEIGHT

  for (const [symbol, weight] of Object.entries(SYMBOL_WEIGHTS)) {
    random -= weight

    if (random < 0) {
      return symbol
    }
  }

  return '🍒'
}

// ============================================================
// REEL STATE
// ============================================================

const reel1Strip = ref([
  weightedRandom(),
  weightedRandom(),
  weightedRandom()
])

const reel2Strip = ref([
  weightedRandom(),
  weightedRandom(),
  weightedRandom()
])

const reel3Strip = ref([
  weightedRandom(),
  weightedRandom(),
  weightedRandom()
])

const reel1Offset = ref(0)
const reel2Offset = ref(0)
const reel3Offset = ref(0)

const reel1Transition = ref(false)
const reel2Transition = ref(false)
const reel3Transition = ref(false)

const reel1Spinning = ref(false)
const reel2Spinning = ref(false)
const reel3Spinning = ref(false)

const reel1Duration = 2400
const reel2Duration = 2800
const reel3Duration = 3200

const reel1 = ref(null)
const reel2 = ref(null)
const reel3 = ref(null)

// ============================================================
// PAYOUT TABLE
//
// These are MULTIPLIERS of the bet.
//
// Example:
// $1 × 1000 = $1000
// $0.05 × 1000 = $50
// $0.005 × 1000 = $5
//
// ============================================================

const payoutTable = {
  '⭐⭐⭐': { payout: 1000 },
  '💎💎💎': { payout: 500 },
  '7️⃣7️⃣7️⃣': { payout: 100 },

  '🔔🔔🔔': { payout: 30 },
  '🍇🍇🍇': { payout: 12 },

  '🍊🍊🍊': { payout: 6 },
  '🍋🍋🍋': { payout: 3 },
  '🍒🍒🍒': { payout: 1.5 }
}

// ============================================================
// EXACT TWO-OF-A-KIND PAYOUT
//
// This value is mathematically solved for the exact 80% RTP
// using the symbol weights above and the three-of-a-kind table.
//
// 1.3529572238422625 × bet
//
// The resulting theoretical RTP is:
// 80.000000000000%
//
// House edge:
// 20.000000000000%
// ============================================================

const TWO_SAME_PAYOUT = 1.3529572238422625

// ============================================================
// WIN CALCULATION
// ============================================================

const checkWin = (a, b, c) => {
  const key = `${a}${b}${c}`

  // -----------------------------
  // THREE OF A KIND
  // -----------------------------

  if (payoutTable[key]) {
    return payoutTable[key].payout * bet.value
  }

  // -----------------------------
  // EXACTLY TWO OF A KIND
  // -----------------------------

  if (a === b || a === c || b === c) {
    return TWO_SAME_PAYOUT * bet.value
  }

  // -----------------------------
  // NO WIN
  // -----------------------------

  return 0
}

// ============================================================
// SPIN REEL
// ============================================================

const spinReel = async (
  stripRef,
  offsetRef,
  transRef,
  spinRef,
  reelRef,
  target,
  duration
) => {
  const longStrip = [
    weightedRandom(),
    target,
    weightedRandom(),
    ...Array.from(
      { length: FILLER_COUNT },
      weightedRandom
    )
  ]

  const startOffset = -(SCROLL_ITEMS * SYMBOL_HEIGHT)

  transRef.value = false
  spinRef.value = true

  stripRef.value = longStrip
  offsetRef.value = startOffset

  await nextTick()

  if (reelRef.value?.innerEl) {
    void reelRef.value.innerEl.offsetHeight
  }

  transRef.value = true
  offsetRef.value = 0

  await new Promise((resolve) => {
    setTimeout(resolve, duration + 50)
  })

  transRef.value = false
  spinRef.value = false

  stripRef.value = [
    weightedRandom(),
    target,
    weightedRandom()
  ]

  offsetRef.value = 0
}

// ============================================================
// SPIN HANDLER
//
// IMPORTANT:
// The clicked symbol is NOT used as the mathematical outcome.
//
// This prevents the player from selecting ⭐ or 💎 and changing
// the RTP.
//
// The click remains a UI interaction only.
// ============================================================

const handleClick = async () => {
  if (isSpinning.value) return

  if (balance.value < bet.value) {
    alert('Insufficient balance!')
    return
  }

  playClick()

  balance.value -= bet.value
  lastWin.value = 0
  showConfetti.value = false
  isSpinning.value = true

  // Generate ALL three outcomes independently
  // using the exact weighted distribution.

  const t1 = weightedRandom()
  const t2 = weightedRandom()
  const t3 = weightedRandom()

  playSpin()

  await Promise.all([
    spinReel(
      reel1Strip,
      reel1Offset,
      reel1Transition,
      reel1Spinning,
      reel1,
      t1,
      reel1Duration
    ),

    spinReel(
      reel2Strip,
      reel2Offset,
      reel2Transition,
      reel2Spinning,
      reel2,
      t2,
      reel2Duration
    ),

    spinReel(
      reel3Strip,
      reel3Offset,
      reel3Transition,
      reel3Spinning,
      reel3,
      t3,
      reel3Duration
    )
  ])

  stopSpin()
  isSpinning.value = false

  // Calculate actual mathematical win
  const win = checkWin(t1, t2, t3)

  if (win > 0) {
    balance.value += win
    lastWin.value = win

    if (win >= 50) {
      showConfetti.value = true
    }

    playWin()
  }
}

// ============================================================
// RANDOM SPIN BUTTON
// ============================================================

const handleRandomSpin = () => {
  handleClick()
}
</script>


<style scoped>
.app-container {
  background: linear-gradient(180deg, #1a1040 0%, #0d0a2a 100%);
  border-radius: 32px;
  border: 2px solid rgba(255, 215, 0, 0.15);
  padding: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
  position: relative;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 16px;
}

.logo { display: flex; align-items: center; gap: 10px; }
.logo-icon { font-size: 28px; }
.logo-text {
  font-size: 18px;
  font-weight: 800;
  background: linear-gradient(135deg, #ffd700, #ff6b35);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.balance-display {
  background: rgba(0, 0, 0, 0.4);
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 215, 0, 0.2);
  text-align: right;
}
.balance-label { font-size: 10px; color: #8888aa; text-transform: uppercase; display: block; }
.balance-amount {
  font-size: 22px;
  font-weight: 700;
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.slot-machine { margin: 10px 0; }
.hint-text {
  text-align: center;
  color: #8888aa;
  font-size: 13px;
  margin-bottom: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.machine-frame {
  background: linear-gradient(180deg, #2a1a3a, #0d0a2a);
  border-radius: 24px;
  padding: 16px;
  border: 3px solid #ffd700;
  box-shadow: 0 0 40px rgba(255, 215, 0, 0.1), inset 0 0 60px rgba(255, 215, 0, 0.05);
  position: relative;
}

.reels-container {
  display: flex;
  gap: 8px;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 16px;
  padding: 12px;
  position: relative;
}

.payline-center {
  position: absolute;
  top: 50%;
  left: 10%;
  right: 10%;
  transform: translateY(-50%);
  height: 2px;
  background: rgba(255, 215, 0, 0.3);
  pointer-events: none;
  z-index: 5;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.win-display {
  margin-top: 12px;
  padding: 12px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 107, 53, 0.15));
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  color: #ffd700;
  animation: pulse-glow 1.5s ease-in-out infinite;
}

.win-display.big-win {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.25), rgba(255, 0, 0, 0.25));
  border-color: rgba(255, 215, 0, 0.6);
  font-size: 26px;
}

@keyframes pulse-glow {
  0%, 100% { text-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
  50% { text-shadow: 0 0 40px rgba(255, 215, 0, 0.8); }
}

@media (max-width: 480px) {
  .app-container { padding: 12px; border-radius: 20px; }
  .logo-text { font-size: 14px; }
  .logo-icon { font-size: 22px; }
  .balance-amount { font-size: 18px; }
}
</style>