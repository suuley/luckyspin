<template>
  <div class="app-container">
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
          <!-- Reel 1 -->
          <div class="reel">
            <div
              class="reel-inner"
              ref="reel1Inner"
              :class="{ 'is-spinning': reel1Spinning }"
              :style="{
                transform: `translateY(${reel1Offset}px)`,
                transition: reel1Transition
                  ? `transform ${reel1Duration}ms cubic-bezier(0.12, 0.8, 0.3, 1)`
                  : 'none'
              }"
            >
              <div
                v-for="(symbol, idx) in reel1Strip"
                :key="idx"
                class="symbol"
                :class="{ highlighted: idx === 1 && !isSpinning }"
                @click="handleClick(1, symbol)"
              >
                {{ symbol }}
              </div>
            </div>
          </div>

          <!-- Reel 2 -->
          <div class="reel">
            <div
              class="reel-inner"
              ref="reel2Inner"
              :class="{ 'is-spinning': reel2Spinning }"
              :style="{
                transform: `translateY(${reel2Offset}px)`,
                transition: reel2Transition
                  ? `transform ${reel2Duration}ms cubic-bezier(0.12, 0.8, 0.3, 1)`
                  : 'none'
              }"
            >
              <div
                v-for="(symbol, idx) in reel2Strip"
                :key="idx"
                class="symbol"
                :class="{ highlighted: idx === 1 && !isSpinning }"
                @click="handleClick(2, symbol)"
              >
                {{ symbol }}
              </div>
            </div>
          </div>

          <!-- Reel 3 -->
          <div class="reel">
            <div
              class="reel-inner"
              ref="reel3Inner"
              :class="{ 'is-spinning': reel3Spinning }"
              :style="{
                transform: `translateY(${reel3Offset}px)`,
                transition: reel3Transition
                  ? `transform ${reel3Duration}ms cubic-bezier(0.12, 0.8, 0.3, 1)`
                  : 'none'
              }"
            >
              <div
                v-for="(symbol, idx) in reel3Strip"
                :key="idx"
                class="symbol"
                :class="{ highlighted: idx === 1 && !isSpinning }"
                @click="handleClick(3, symbol)"
              >
                {{ symbol }}
              </div>
            </div>
          </div>
        </div>
        <div class="payline-center"></div>
      </div>
    </div>

    <!-- Controls -->
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
          @click="bet = amount"
          :disabled="isSpinning"
        >
          ${{ amount.toFixed(2) }}
        </button>
      </div>

      <button class="spin-btn" @click="handleRandomSpin" :disabled="isSpinning || balance < bet">
        <span v-if="!isSpinning">🎲 RANDOM SPIN</span>
        <span v-else>SPINNING...</span>
      </button>
    </div>

    <!-- Result -->
    <div v-if="lastWin > 0" class="win-display" :class="{ 'big-win': lastWin >= 50 }">
      🎉 WIN ${{ lastWin.toFixed(2) }} 🎉
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

// ── STATE ──
const balance = ref(20.0)
const bet = ref(1.0)
const lastWin = ref(0)
const isSpinning = ref(false)

const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣', '⭐']
const SYMBOL_HEIGHT = 70
const FILLER_COUNT = 50
const SCROLL_ITEMS = 40

const rnd = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]

// Short idle strips: [top, center, bottom]
const reel1Strip = ref([rnd(), rnd(), rnd()])
const reel2Strip = ref([rnd(), rnd(), rnd()])
const reel3Strip = ref([rnd(), rnd(), rnd()])

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

// Template refs for forcing reflow
const reel1Inner = ref(null)
const reel2Inner = ref(null)
const reel3Inner = ref(null)

// ── BET CONTROLS ──
const step = computed(() => {
  if (bet.value < 1) return 0.05
  if (bet.value < 5) return 0.25
  return 0.5
})

const quickBetAmounts = [0.05, 0.25, 0.5, 1, 2.5, 5, 10]

const adjustBet = (amount) => {
  const n = Math.round((bet.value + amount) * 100) / 100
  if (n >= 0.05 && n <= 10) bet.value = n
}

// ── PAYOUT ──
const payoutTable = {
  '🍒🍒🍒': 10, '🍋🍋🍋': 20, '🍊🍊🍊': 30, '🍇🍇🍇': 50,
  '🔔🔔🔔': 100, '💎💎💎': 200, '7️⃣7️⃣7️⃣': 500, '⭐⭐⭐': 1000
}

const checkWin = (a, b, c) => {
  const key = `${a}${b}${c}`
  if (payoutTable[key]) return payoutTable[key] * bet.value
  if (a === b && a !== c) return 5 * bet.value * 0.5
  if (a === c && a !== b) return 5 * bet.value * 0.3
  if (b === c && a !== b) return 5 * bet.value * 0.3
  return 0
}

// ── CORE SPIN LOGIC ──
const spinReel = async (stripRef, offsetRef, transRef, spinRef, innerRef, target, duration) => {
  // 1. Build a long strip: [random, TARGET, random, ...50 fillers]
  //    Target sits at index 1 so it lands in the center row.
  const longStrip = [rnd(), target, rnd(), ...Array.from({ length: FILLER_COUNT }, rnd)]

  // 2. Calculate offsets
  //    End:   translateY = 0        → shows indices 0, 1, 2 (target centered)
  //    Start: translateY = -(SCROLL_ITEMS * 70) → shows indices 40, 41, 42
  //    Going from -2800 → 0 means translateY INCREASES → strip slides DOWN
  //    → symbols enter from the TOP and exit at the BOTTOM ✓
  const startOffset = -(SCROLL_ITEMS * SYMBOL_HEIGHT)
  const endOffset = 0

  // 3. Apply long strip + start position with NO transition
  transRef.value = false
  spinRef.value = true
  stripRef.value = longStrip
  offsetRef.value = startOffset

  // 4. Wait for Vue to patch the DOM, then force a browser reflow
  await nextTick()
  if (innerRef.value) void innerRef.value.offsetHeight

  // 5. NOW enable the transition and set the end position → animation fires
  transRef.value = true
  offsetRef.value = endOffset

  // 6. Wait for the CSS transition to finish
  await new Promise((r) => setTimeout(r, duration + 50))

  // 7. Cleanup: snap back to a short 3-item strip at offset 0
  transRef.value = false
  spinRef.value = false
  stripRef.value = [rnd(), target, rnd()]
  offsetRef.value = 0
}

// ── CLICK HANDLER ──
const handleClick = async (clickedReel, clickedSymbol) => {
  if (isSpinning.value) return
  if (balance.value < bet.value) {
    alert('Insufficient balance!')
    return
  }

  balance.value -= bet.value
  lastWin.value = 0
  isSpinning.value = true

  const t1 = clickedReel === 1 ? clickedSymbol : rnd()
  const t2 = clickedReel === 2 ? clickedSymbol : rnd()
  const t3 = clickedReel === 3 ? clickedSymbol : rnd()

  // Fire all three reels simultaneously (staggered durations create the cascade stop)
  await Promise.all([
    spinReel(reel1Strip, reel1Offset, reel1Transition, reel1Spinning, reel1Inner, t1, reel1Duration),
    spinReel(reel2Strip, reel2Offset, reel2Transition, reel2Spinning, reel2Inner, t2, reel2Duration),
    spinReel(reel3Strip, reel3Offset, reel3Transition, reel3Spinning, reel3Inner, t3, reel3Duration)
  ])

  isSpinning.value = false

  const win = checkWin(t1, t2, t3)
  if (win > 0) {
    balance.value += win
    lastWin.value = win
  }
}

// ── RANDOM SPIN BUTTON ──
const handleRandomSpin = () => {
  if (isSpinning.value) return
  if (balance.value < bet.value) {
    alert('Insufficient balance!')
    return
  }
  // Pick a random symbol from the current display to simulate "clicking" it
  handleClick(0, rnd())
}
</script>

<style scoped>
.app-container {
  background: linear-gradient(180deg, #1a1040 0%, #0d0a2a 100%);
  border-radius: 32px;
  border: 2px solid rgba(255, 215, 0, 0.15);
  padding: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
  max-width: 500px;
  margin: 0 auto;
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
  font-size: 22px; font-weight: 700; color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.slot-machine { margin: 10px 0; }
.hint-text {
  text-align: center; color: #8888aa; font-size: 13px;
  margin-bottom: 8px; font-weight: 600; letter-spacing: 0.5px;
}

.machine-frame {
  background: linear-gradient(180deg, #2a1a3a, #0d0a2a);
  border-radius: 24px; padding: 16px;
  border: 3px solid #ffd700;
  box-shadow: 0 0 40px rgba(255, 215, 0, 0.1), inset 0 0 60px rgba(255, 215, 0, 0.05);
  position: relative;
}

.reels-container {
  display: flex; gap: 8px; justify-content: center;
  background: rgba(0, 0, 0, 0.5); border-radius: 16px;
  padding: 12px; position: relative;
}

.reel {
  flex: 1; overflow: hidden; position: relative;
  background: rgba(0, 0, 0, 0.6); border-radius: 8px;
  height: 210px;
  mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
}

.reel-inner {
  display: flex; flex-direction: column; align-items: center;
  will-change: transform;
}

/* ── Motion blur while the wheel is turning ── */
.reel-inner.is-spinning {
  filter: blur(1.5px) brightness(0.85);
}

.symbol {
  display: flex; align-items: center; justify-content: center;
  font-size: 36px; width: 100%; height: 70px;
  flex-shrink: 0; user-select: none; cursor: pointer;
  transition: transform 0.15s, filter 0.15s;
}
.symbol:hover { transform: scale(1.15); filter: brightness(1.3); z-index: 10; }
.symbol.highlighted {
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.6));
  transform: scale(1.15); z-index: 10;
}

.payline-center {
  position: absolute; top: 50%; left: 10%; right: 10%;
  transform: translateY(-50%); height: 2px;
  background: rgba(255, 215, 0, 0.3);
  pointer-events: none; z-index: 5;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.controls { margin-top: 16px; display: flex; flex-direction: column; gap: 12px; }

.bet-controls {
  display: flex; align-items: center; justify-content: center;
  gap: 12px; background: rgba(0, 0, 0, 0.3);
  border-radius: 16px; padding: 8px 16px;
}
.bet-btn {
  width: 44px; height: 44px; border-radius: 50%; border: none;
  background: rgba(255, 215, 0, 0.1); color: #ffd700;
  font-size: 24px; font-weight: 700; cursor: pointer; transition: all 0.2s;
}
.bet-btn:hover:not(:disabled) { background: rgba(255, 215, 0, 0.2); }
.bet-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.bet-display { text-align: center; flex: 1; }
.bet-label { font-size: 10px; color: #8888aa; text-transform: uppercase; display: block; }
.bet-amount { font-size: 24px; font-weight: 700; color: white; }

.quick-bets { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; }
.quick-bet-btn {
  padding: 6px 14px; border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.03); color: #8888aa;
  font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.quick-bet-btn:hover:not(:disabled) { background: rgba(255, 255, 255, 0.05); color: white; }
.quick-bet-btn.active {
  background: rgba(255, 215, 0, 0.15);
  border-color: rgba(255, 215, 0, 0.3); color: #ffd700;
}
.quick-bet-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.spin-btn {
  width: 100%; padding: 18px; border: none; border-radius: 16px;
  background: linear-gradient(135deg, #ffd700, #ff6b35); color: #0a0a1a;
  font-size: 20px; font-weight: 800; letter-spacing: 2px;
  cursor: pointer; transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3); text-transform: uppercase;
}
.spin-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(255, 215, 0, 0.4); }
.spin-btn:active:not(:disabled) { transform: scale(0.98); }
.spin-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.win-display {
  margin-top: 12px; padding: 12px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 107, 53, 0.15));
  border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 12px;
  text-align: center; font-size: 20px; font-weight: 700; color: #ffd700;
  animation: pulse-glow 1.5s ease-in-out infinite;
}
.win-display.big-win {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.25), rgba(255, 0, 0, 0.25));
  border-color: rgba(255, 215, 0, 0.6); font-size: 26px;
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
  .reel { height: 210px; }
  .symbol { font-size: 28px; height: 70px; }
  .bet-btn { width: 36px; height: 36px; font-size: 20px; }
  .bet-amount { font-size: 20px; }
  .spin-btn { padding: 14px; font-size: 16px; }
}
</style>