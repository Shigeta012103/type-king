<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useTypingEngine } from '../composables/useTypingEngine'

const store = useGameStore()
const areaRef = ref<HTMLElement | null>(null)
const wordRef = ref<HTMLElement | null>(null)
const isSlam = ref(false)
const isShake = ref(false)

const {
  currentWord,
  displayRomaji,
  typedRomaji,
  handleKeyPress,
} = useTypingEngine({
  onType() {
    store.addTypes(1)
    triggerShake()
    spawnParticle()
  },
  onWordComplete() {
    triggerSlam()
  },
})

function triggerShake(): void {
  isShake.value = false
  void wordRef.value?.offsetWidth
  isShake.value = true
}

function triggerSlam(): void {
  isSlam.value = false
  void areaRef.value?.offsetWidth
  isSlam.value = true
}

// パーティクル
interface Particle {
  id: number
  x: number
  y: number
  char: string
}

const particles = ref<Particle[]>([])
let particleId = 0

const PARTICLE_CHARS = ['⚡', '✦', '🔥', '💥', '⌨', '✨']

function spawnParticle(): void {
  const area = areaRef.value
  if (!area) return

  const rect = area.getBoundingClientRect()
  const particle: Particle = {
    id: particleId++,
    x: Math.random() * rect.width,
    y: rect.height * 0.4 + Math.random() * rect.height * 0.3,
    char: PARTICLE_CHARS[Math.floor(Math.random() * PARTICLE_CHARS.length)],
  }
  particles.value.push(particle)

  setTimeout(() => {
    particles.value = particles.value.filter((p) => p.id !== particle.id)
  }, 600)
}

function onKeyDown(event: KeyboardEvent): void {
  if (event.ctrlKey || event.altKey || event.metaKey) return
  if (event.key.length !== 1) return

  event.preventDefault()
  handleKeyPress(event.key.toLowerCase())
}

function onAnimationEnd(): void {
  isSlam.value = false
}

function onShakeEnd(): void {
  isShake.value = false
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <div
    ref="areaRef"
    class="typing-area"
    :class="{ slam: isSlam }"
    @animationend="onAnimationEnd"
  >
    <!-- パーティクル -->
    <span
      v-for="p in particles"
      :key="p.id"
      class="particle"
      :style="{ left: p.x + 'px', top: p.y + 'px' }"
      aria-hidden="true"
    >
      {{ p.char }}
    </span>

    <div
      ref="wordRef"
      class="word-display"
      :class="{ shake: isShake }"
      @animationend.stop="onShakeEnd"
    >
      <span class="word-japanese">{{ currentWord.display }}</span>
    </div>
    <div class="romaji-display">
      <span class="romaji-typed">{{ typedRomaji }}</span>
      <span class="romaji-remaining">{{ displayRomaji }}</span>
      <span class="cursor" aria-hidden="true">|</span>
    </div>
    <p class="typing-hint">キーボードで入力してください</p>
  </div>
</template>

<style scoped>
.typing-area {
  position: relative;
  padding: 2rem;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%);
  border-radius: 16px;
  border: 2px solid rgba(0, 210, 255, 0.3);
  text-align: center;
  box-shadow: 0 0 30px rgba(0, 210, 255, 0.1);
  overflow: hidden;
  transition: box-shadow 0.15s ease;
}

/* ワード完了時の叩きつけエフェクト */
.typing-area.slam {
  animation: slam-area 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes slam-area {
  0% {
    transform: scale(0.92);
    box-shadow: 0 0 60px rgba(0, 210, 255, 0.5), 0 0 120px rgba(123, 47, 247, 0.3);
  }
  30% {
    transform: scale(1.03);
  }
  50% {
    box-shadow: 0 0 40px rgba(0, 210, 255, 0.3), 0 0 80px rgba(123, 47, 247, 0.15);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 30px rgba(0, 210, 255, 0.1);
  }
}

/* タイプ時の揺れ */
.word-display {
  margin-bottom: 1rem;
}

.word-display.shake {
  animation: shake-word 0.12s ease-out;
}

@keyframes shake-word {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-3px) rotate(-0.5deg);
  }
  50% {
    transform: translateX(2px) rotate(0.3deg);
  }
  75% {
    transform: translateX(-1px);
  }
  100% {
    transform: translateX(0);
  }
}

.word-japanese {
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.1em;
  display: inline-block;
}

/* パーティクル */
.particle {
  position: absolute;
  font-size: 1rem;
  pointer-events: none;
  animation: particle-fly 0.6s ease-out forwards;
  z-index: 10;
}

@keyframes particle-fly {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-60px) scale(0.3) rotate(40deg);
  }
}

.romaji-display {
  font-size: 1.5rem;
  font-family: 'Courier New', monospace;
  min-height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.romaji-typed {
  color: #00d2ff;
  font-weight: 700;
}

.romaji-remaining {
  color: rgba(255, 255, 255, 0.4);
  font-weight: 400;
}

.cursor {
  color: #00d2ff;
  animation: blink 1s step-end infinite;
  font-weight: 300;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

.typing-hint {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.3);
}
</style>
