<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { formatNumber } from '../utils/formatNumber'

const store = useGameStore()
const useShortFormat = ref(true)

function formatScore(value: number): string {
  if (useShortFormat.value) return formatNumber(value)
  return Math.floor(value).toLocaleString()
}

const displayTotal = computed(() => formatScore(store.totalTypes))
const displayTps = computed(() => formatScore(store.typesPerSecond))
const displayMultiplier = computed(() => `x${store.globalMultiplier}`)

function toggleFormat(): void {
  useShortFormat.value = !useShortFormat.value
}
</script>

<template>
  <div class="score-display">
    <div class="score-main">
      <span class="score-value">{{ displayTotal }}</span>
      <span class="score-label">タイプ</span>
    </div>
    <div class="score-sub">
      <div class="score-item">
        <span class="score-item-value">{{ displayTps }}</span>
        <span class="score-item-label">タイプ/秒</span>
      </div>
      <div class="score-item">
        <span class="score-item-value">{{ displayMultiplier }}</span>
        <span class="score-item-label">倍率</span>
      </div>
    </div>
    <button
      class="format-toggle"
      :aria-label="`数値表示を${useShortFormat ? '全桁' : '省略'}に切り替え`"
      @click="toggleFormat"
    >
      {{ useShortFormat ? '123...' : 'K/M' }}
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
