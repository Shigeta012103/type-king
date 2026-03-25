<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { formatNumber } from '../utils/formatNumber'

const store = useGameStore()

const displayTotal = computed(() => formatNumber(Math.floor(store.totalTypes)))
const displayTps = computed(() => formatNumber(store.typesPerSecond))
const displayMultiplier = computed(() => `x${store.globalMultiplier}`)
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
</style>
