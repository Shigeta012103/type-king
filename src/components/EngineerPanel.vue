<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { ENGINEER_DEFINITIONS } from '../constants/engineers'
import { formatNumber } from '../utils/formatNumber'

const store = useGameStore()

const engineerItems = computed(() =>
  ENGINEER_DEFINITIONS.map((def) => {
    const owned = store.engineers.find((e) => e.definitionId === def.id)
    const count = owned?.count ?? 0
    const cost = store.getEngineerCost(def.id)
    const canAfford = store.totalTypes >= cost
    return { ...def, count, cost, canAfford }
  })
)

function hire(definitionId: string): void {
  store.hireEngineer(definitionId)
}
</script>

<template>
  <div class="engineer-panel">
    <h2 class="panel-title">
      <span class="panel-icon" aria-hidden="true">👥</span>
      エンジニア雇用
    </h2>
    <div class="engineer-list">
      <button
        v-for="eng in engineerItems"
        :key="eng.id"
        class="engineer-card"
        :class="{ affordable: eng.canAfford, owned: eng.count > 0 }"
        :disabled="!eng.canAfford"
        :aria-label="`${eng.name}を雇用 コスト${eng.cost}タイプ 現在${eng.count}人`"
        @click="hire(eng.id)"
      >
        <div class="engineer-header">
          <span class="engineer-icon" aria-hidden="true">{{ eng.icon }}</span>
          <div class="engineer-info">
            <span class="engineer-name">{{ eng.name }}</span>
            <span class="engineer-desc">{{ eng.description }}</span>
          </div>
          <span class="engineer-count" v-if="eng.count > 0">
            {{ eng.count }}
          </span>
        </div>
        <div class="engineer-footer">
          <span class="engineer-tps">{{ eng.typesPerSecond }}タイプ/秒</span>
          <span class="engineer-cost" :class="{ affordable: eng.canAfford }">
            {{ formatNumber(eng.cost) }} タイプ
          </span>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.engineer-panel {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  padding: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.panel-icon {
  font-size: 1.25rem;
}

.engineer-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.engineer-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
}

.engineer-card:hover:not(:disabled) {
  background: rgba(0, 210, 255, 0.1);
  border-color: rgba(0, 210, 255, 0.3);
  transform: translateY(-1px);
}

.engineer-card:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.engineer-card.affordable {
  border-color: rgba(0, 210, 255, 0.3);
}

.engineer-card.owned {
  background: rgba(0, 210, 255, 0.05);
}

.engineer-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.engineer-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.engineer-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.engineer-name {
  font-weight: 700;
  color: #fff;
  font-size: 0.95rem;
}

.engineer-desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.engineer-count {
  background: linear-gradient(135deg, #00d2ff, #7b2ff7);
  color: #fff;
  font-weight: 800;
  font-size: 0.9rem;
  min-width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.engineer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.engineer-tps {
  color: rgba(255, 255, 255, 0.5);
}

.engineer-cost {
  color: rgba(255, 100, 100, 0.8);
  font-weight: 600;
}

.engineer-cost.affordable {
  color: #4ade80;
}
</style>
