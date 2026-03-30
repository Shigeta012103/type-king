<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'

const store = useGameStore()

const displayTotal = computed(() => store.fmt(store.totalTypes))
const displayTps = computed(() => store.fmt(store.typesPerSecond))
const displayMultiplier = computed(() => `x${store.fmt(store.effectiveTypingMultiplier)}`)

const feverCountdown = computed(() =>
  Math.ceil(store.nextFeverMs / 1000)
)

const feverRemaining = computed(() =>
  (store.feverRemainingMs / 1000).toFixed(1)
)

const nextFeverDisplay = computed(() => {
  const sec = Math.ceil(store.nextFeverMs / 1000)
  const min = Math.floor(sec / 60)
  const s = sec % 60
  return min > 0 ? `${min}:${String(s).padStart(2, '0')}` : `${s}s`
})

</script>

<template>
  <div class="score-display" :class="{ fever: store.isFeverActive, warning: store.isFeverWarning }">
    <!-- フィーバーバナー -->
    <div class="fever-banner" v-if="store.isFeverActive" aria-live="assertive">
      <span class="fever-icon" aria-hidden="true">🔥</span>
      FEVER TIME
      <span class="fever-icon" aria-hidden="true">🔥</span>
      <span class="fever-timer">{{ feverRemaining }}s</span>
    </div>
    <div class="fever-warn" v-else-if="store.isFeverWarning" aria-live="polite">
      <span class="warn-text">FEVER まで {{ feverCountdown }}秒</span>
    </div>

    <div class="score-main">
      <span class="score-value" :class="{ 'fever-glow': store.isFeverActive }">
        {{ displayTotal }}
      </span>
      <span class="score-label">タイプ</span>
    </div>
    <div class="score-sub">
      <div class="score-item">
        <span class="score-item-value">{{ displayTps }}</span>
        <span class="score-item-label">タイプ/秒</span>
      </div>
      <div class="score-item">
        <span class="score-item-value" :class="{ 'fever-mult': store.isFeverActive }">
          {{ displayMultiplier }}
        </span>
        <span class="score-item-label">タイプ倍率</span>
      </div>
      <div class="score-item" v-if="!store.isFeverActive && !store.isFeverWarning">
        <span class="score-item-value next-fever">{{ nextFeverDisplay }}</span>
        <span class="score-item-label">次のFEVER</span>
      </div>
    </div>
    <button
      class="format-toggle"
      :aria-label="`数値表示を${store.useShortFormat ? '全桁' : '省略'}に切り替え`"
      @click="store.toggleFormat()"
    >
      {{ store.useShortFormat ? '123...' : '万/億' }}
    </button>
  </div>
</template>

<style scoped>
.score-display {
  text-align: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.score-display.fever {
  border-color: rgba(255, 165, 0, 0.6);
  box-shadow: 0 0 30px rgba(255, 165, 0, 0.2), 0 0 60px rgba(255, 100, 0, 0.1);
  background: linear-gradient(135deg, #2a1a0e 0%, #1e1a2e 100%);
  animation: fever-pulse 0.8s ease-in-out infinite alternate;
}

.score-display.warning {
  border-color: rgba(255, 200, 0, 0.4);
  animation: warn-flash 0.5s ease-in-out infinite alternate;
}

@keyframes fever-pulse {
  from {
    box-shadow: 0 0 30px rgba(255, 165, 0, 0.2), 0 0 60px rgba(255, 100, 0, 0.1);
  }
  to {
    box-shadow: 0 0 50px rgba(255, 165, 0, 0.35), 0 0 100px rgba(255, 100, 0, 0.15);
  }
}

@keyframes warn-flash {
  from { border-color: rgba(255, 200, 0, 0.2); }
  to { border-color: rgba(255, 200, 0, 0.6); }
}

.fever-banner {
  font-size: 1.25rem;
  font-weight: 900;
  color: #ffa500;
  margin-bottom: 0.75rem;
  letter-spacing: 0.15em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  animation: fever-text-glow 0.6s ease-in-out infinite alternate;
}

@keyframes fever-text-glow {
  from { text-shadow: 0 0 10px rgba(255, 165, 0, 0.5); }
  to { text-shadow: 0 0 25px rgba(255, 165, 0, 0.8), 0 0 50px rgba(255, 100, 0, 0.4); }
}

.fever-timer {
  font-size: 0.9rem;
  font-weight: 700;
  color: #fff;
  background: rgba(255, 165, 0, 0.3);
  padding: 0.1rem 0.5rem;
  border-radius: 4px;
  margin-left: 0.25rem;
}

.fever-warn {
  margin-bottom: 0.75rem;
}

.warn-text {
  font-size: 0.9rem;
  font-weight: 700;
  color: #ffd700;
  animation: warn-text-pulse 0.5s ease-in-out infinite alternate;
}

@keyframes warn-text-pulse {
  from { opacity: 0.6; }
  to { opacity: 1; }
}

.score-main {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.score-value {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #00d2ff, #7b2ff7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.score-value.fever-glow {
  background: linear-gradient(135deg, #ffa500, #ff4500, #ffd700);
  -webkit-background-clip: text;
  background-clip: text;
}

.score-label {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
}

.score-sub {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.score-item {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.score-item-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #00d2ff;
}

.score-item-value.fever-mult {
  color: #ffa500;
}

.score-item-value.next-fever {
  color: rgba(255, 215, 0, 0.6);
}

.score-item-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

.format-toggle {
  margin-top: 0.75rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 99px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.format-toggle:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
}
</style>
