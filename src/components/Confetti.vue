<template>
  <canvas
    v-if="show"
    ref="canvas"
    class="confetti-canvas"
  ></canvas>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  amount: { type: Number, default: 1 }
})

const emit = defineEmits(['done'])

const canvas = ref(null)
let animationId = null
let particles = []

const colors = ['#ffd700', '#ff6b35', '#ff3366', '#00d4ff', '#7cff00', '#ff00ff']

const createParticles = () => {
  particles = []
  let count, speed, size
  
  // Scale celebration based on win amount
  if (props.amount >= 50) {
    count = 300; speed = 18; size = 10
  } else if (props.amount >= 20) {
    count = 180; speed = 14; size = 8
  } else if (props.amount >= 10) {
    count = 120; speed = 12; size = 7
  } else {
    count = 60; speed = 10; size = 6
  }
  
  console.log(`🎉 Creating ${count} confetti particles for $${props.amount} win`)
  
  // Get actual canvas dimensions to ensure particles spawn in the true center
  const centerX = canvas.value.width / 2
  const centerY = canvas.value.height / 2

  for (let i = 0; i < count; i++) {
    particles.push({
      x: centerX,
      y: centerY,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 1) * speed,
      size: Math.random() * size + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 15,
      life: 1.0
    })
  }
}

const animate = () => {
  if (!canvas.value) return
  
  const ctx = canvas.value.getContext('2d')
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  let aliveCount = 0
  particles.forEach((p) => {
    if (p.life <= 0) return
    aliveCount++

    p.x += p.vx
    p.y += p.vy
    p.vy += 0.4 // gravity
    p.rotation += p.rotationSpeed
    p.life -= 0.015

    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate((p.rotation * Math.PI) / 180)
    ctx.globalAlpha = p.life
    ctx.fillStyle = p.color
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
    ctx.restore()
  })

  if (aliveCount > 0) {
    animationId = requestAnimationFrame(animate)
  } else {
    console.log('✅ Confetti animation finished')
    emit('done')
  }
}

watch(() => props.show, async (newVal) => {
  console.log('🎊 Confetti show prop changed to:', newVal, '| Win Amount:', props.amount)
  
  if (newVal) {
    await nextTick()
    if (canvas.value) {
      console.log('✅ Canvas mounted, starting animation')
      
      // Dynamically match canvas internal resolution to the screen size
      // This prevents stretching and ensures particles spawn in the true center
      canvas.value.width = window.innerWidth
      canvas.value.height = window.innerHeight
      
      createParticles()
      animate()
    }
  } else {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
})
</script>

<style scoped>
.confetti-canvas {
  position: fixed; /* Changed from absolute to fixed to escape parent container clipping */
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999; /* Guaranteed to be above the slot machine UI */
}
</style>