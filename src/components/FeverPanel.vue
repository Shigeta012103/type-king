<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { FEVER_UPGRADE_DEFINITIONS } from '../constants/feverUpgrades'

const store = useGameStore()

const feverItems = computed(() =>
  FEVER_UPGRADE_DEFINITIONS.map((def) => {
    const owned = store.feverUpgrades.find((u) => u.definitionId === def.id)
    const level = owned?.level ?? 0
    const cost = store.getFeverUpgradeCost(def.id)
    const canAfford = store.totalTypes >= cost
    return { ...def, level, cost, canAfford }
  })
)

function purchase(definitionId: string): void {
  store.purchaseFeverUpgrade(definitionId)
}
</script>

<template>
  <div class="fever-panel">
    <div class="fever-status">
      <div class="status-row">
        <span class="status-label">倍率</span>
        <span class="status-value">x{{ store.feverMultiplier }}</span>
      </div>
      <div class="status-row">
        <span class="status-label">持続</span>
        <span class="status-value">{{ store.feverDurationMs / 1000 }}秒</span>
      </div>
      <div class="status-row">
        <span class="status-label">間隔</span>
        <span class="status-value">{{ store.feverCooldownMs / 1000 }}秒</span>
      </div>
      <div class="status-row" v-if="store.feverSyncRate > 0">
        <span class="status-label">自動</span>
        <span class="status-value">{{ Math.round(store.feverSyncRate * 100) }}%</span>
      </div>
    </div>
    <div class="fever-list">
      <button
        v-for="fever in feverItems"
        :key="fever.id"
        class="fever-card"
        :class="{ affordable: fever.canAfford, owned: fever.level > 0 }"
        :disabled="!fever.canAfford"
        :aria-label="`${fever.name}を購入 Lv.${fever.level} コスト${fever.cost}タイプ`"
        @click="purchase(fever.id)"
      >
        <span class="fever-icon" aria-hidden="true">{{ fever.icon }}</span>
        <div class="fever-info">
          <div class="fever-name-row">
            <span class="fever-name">{{ fever.name }}</span>
            <span class="fever-level" v-if="fever.level > 0">
              Lv.{{ fever.level }}
            </span>
          </div>
          <span class="fever-desc">{{ fever.description }}</span>
        </div>
        <span class="fever-cost" :class="{ affordable: fever.canAfford }">
          {{ store.fmt(fever.cost) }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.fever-panel {
  /* パネル外枠はApp.vueのside-panelで管理 */
}

.fever-status {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 165, 0, 0.08);
  border: 1px solid rgba(255, 165, 0, 0.15);
  border-radius: 10px;
  margin-bottom: 0.75rem;
}

.status-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.status-label {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
}

.status-value {
  font-size: 1rem;
  font-weight: 800;
  color: #ffa500;
}

.fever-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fever-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

.fever-card:hover:not(:disabled) {
  background: rgba(255, 165, 0, 0.1);
  border-color: rgba(255, 165, 0, 0.3);
  transform: translateY(-1px);
}

.fever-card:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.fever-card.affordable {
  border-color: rgba(255, 165, 0, 0.3);
}

.fever-card.owned {
  background: rgba(255, 165, 0, 0.05);
}

.fever-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.fever-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: 0.15rem;
}

.fever-name-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.fever-name {
  font-weight: 700;
  color: #fff;
  font-size: 0.95rem;
}

.fever-level {
  font-size: 0.7rem;
  font-weight: 700;
  color: #fbbf24;
  background: rgba(255, 165, 0, 0.2);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

.fever-desc {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
}

.fever-cost {
  color: rgba(255, 100, 100, 0.8);
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.fever-cost.affordable {
  color: #4ade80;
}
</style>
