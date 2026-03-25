<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { UPGRADE_DEFINITIONS } from '../constants/upgrades'
import { formatNumber } from '../utils/formatNumber'

const store = useGameStore()

const upgradeItems = computed(() =>
  UPGRADE_DEFINITIONS.map((def) => {
    const owned = store.upgrades.find((u) => u.definitionId === def.id)
    const level = owned?.level ?? 0
    const cost = store.getUpgradeCost(def.id)
    const canAfford = store.totalTypes >= cost
    const nextBonus = store.getUpgradeNextBonus(def.id)
    const totalBonus = store.getUpgradeTotalBonus(def.id)
    return { ...def, level, cost, canAfford, nextBonus, totalBonus }
  })
)

function purchase(definitionId: string): void {
  store.purchaseUpgrade(definitionId)
}
</script>

<template>
  <div class="upgrade-panel">
    <h2 class="panel-title">
      <span class="panel-icon" aria-hidden="true">⬆️</span>
      アップグレード
      <span class="panel-hint">タイピング強化</span>
    </h2>
    <div class="upgrade-list">
      <button
        v-for="upgrade in upgradeItems"
        :key="upgrade.id"
        class="upgrade-card"
        :class="{ affordable: upgrade.canAfford, owned: upgrade.level > 0 }"
        :disabled="!upgrade.canAfford"
        :aria-label="`${upgrade.name}を購入 Lv.${upgrade.level} コスト${upgrade.cost}タイプ`"
        @click="purchase(upgrade.id)"
      >
        <span class="upgrade-icon" aria-hidden="true">{{ upgrade.icon }}</span>
        <div class="upgrade-info">
          <div class="upgrade-name-row">
            <span class="upgrade-name">{{ upgrade.name }}</span>
            <span class="upgrade-level" v-if="upgrade.level > 0">
              Lv.{{ upgrade.level }}
            </span>
          </div>
          <span class="upgrade-desc">{{ upgrade.description }}</span>
          <div class="upgrade-bonus-row">
            <span class="upgrade-next-bonus">
              次: +{{ formatNumber(upgrade.nextBonus) }}
            </span>
            <span class="upgrade-current-bonus" v-if="upgrade.totalBonus > 0">
              現在: +{{ formatNumber(upgrade.totalBonus) }}
            </span>
          </div>
        </div>
        <span class="upgrade-cost" :class="{ affordable: upgrade.canAfford }">
          {{ formatNumber(upgrade.cost) }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.upgrade-panel {
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

.panel-hint {
  font-size: 0.7rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
  margin-left: auto;
}

.upgrade-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upgrade-card {
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

.upgrade-card:hover:not(:disabled) {
  background: rgba(123, 47, 247, 0.1);
  border-color: rgba(123, 47, 247, 0.3);
  transform: translateY(-1px);
}

.upgrade-card:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upgrade-card.affordable {
  border-color: rgba(123, 47, 247, 0.3);
}

.upgrade-card.owned {
  background: rgba(123, 47, 247, 0.05);
}

.upgrade-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.upgrade-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: 0.15rem;
}

.upgrade-name-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.upgrade-name {
  font-weight: 700;
  color: #fff;
  font-size: 0.95rem;
}

.upgrade-level {
  font-size: 0.7rem;
  font-weight: 700;
  color: #c084fc;
  background: rgba(123, 47, 247, 0.2);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

.upgrade-desc {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
}

.upgrade-bonus-row {
  display: flex;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.upgrade-next-bonus {
  color: #4ade80;
  font-weight: 600;
}

.upgrade-current-bonus {
  color: rgba(255, 255, 255, 0.4);
}

.upgrade-cost {
  color: rgba(255, 100, 100, 0.8);
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.upgrade-cost.affordable {
  color: #4ade80;
}
</style>
