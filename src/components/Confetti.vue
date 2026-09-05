<template>
  <canvas
    v-if="show"
    ref="canvas"
    class="confetti-canvas"
    width="500"
    height="600"
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
  
  for (let i = 0; i < count; i++) {
    particles.push({
      x: 250,
      y: 300,
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
  ctx.clearRect(0, 0, 500, 600)

  let aliveCount = 0
  particles.forEach((p) => {
    if (p.life <= 0) return
    aliveCount++

    p.x += p.vx
    p.y += p.vy
    p.vy += 0.4
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
    emit('done')
  }
}

watch(() => props.show, async (newVal) => {
  console.log('🎊 Confetti show changed to:', newVal)
  
  if (newVal) {
    await nextTick()
    if (canvas.value) {
      console.log('✅ Canvas mounted, starting animation')
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
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}
</style>