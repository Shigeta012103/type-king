<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { UPGRADE_DEFINITIONS } from '../constants/upgrades'
import { formatNumber } from '../utils/formatNumber'

const store = useGameStore()

const availableUpgrades = computed(() =>
  UPGRADE_DEFINITIONS.filter(
    (u) => !store.purchasedUpgradeIds.includes(u.id)
  ).map((u) => ({
    ...u,
    canAfford: store.totalTypes >= u.cost,
  }))
)

const purchasedCount = computed(
  () => store.purchasedUpgradeIds.length
)

function purchase(upgradeId: string): void {
  store.purchaseUpgrade(upgradeId)
}
</script>

<template>
  <div class="upgrade-panel">
    <h2 class="panel-title">
      <span class="panel-icon" aria-hidden="true">⬆️</span>
      アップグレード
      <span class="purchased-badge" v-if="purchasedCount > 0">
        {{ purchasedCount }}
      </span>
    </h2>
    <div v-if="availableUpgrades.length === 0" class="all-purchased">
      全てのアップグレードを購入済み!
    </div>
    <div v-else class="upgrade-list">
      <button
        v-for="upgrade in availableUpgrades"
        :key="upgrade.id"
        class="upgrade-card"
        :class="{ affordable: upgrade.canAfford }"
        :disabled="!upgrade.canAfford"
        :aria-label="`${upgrade.name}を購入 コスト${upgrade.cost}タイプ 効果:${upgrade.description}`"
        @click="purchase(upgrade.id)"
      >
        <span class="upgrade-icon" aria-hidden="true">{{ upgrade.icon }}</span>
        <div class="upgrade-info">
          <span class="upgrade-name">{{ upgrade.name }}</span>
          <span class="upgrade-desc">{{ upgrade.description }}</span>
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

.purchased-badge {
  background: #7b2ff7;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 99px;
  margin-left: auto;
}

.all-purchased {
  text-align: center;
  padding: 1.5rem;
  color: #4ade80;
  font-weight: 600;
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

.upgrade-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.upgrade-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.upgrade-name {
  font-weight: 700;
  color: #fff;
  font-size: 0.95rem;
}

.upgrade-desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
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
