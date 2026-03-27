<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { UPGRADE_DEFINITIONS } from '../constants/upgrades'
import { FEVER_UPGRADE_DEFINITIONS } from '../constants/feverUpgrades'
import { formatNumber } from '../utils/formatNumber'

const store = useGameStore()

const upgradeItems = computed(() =>
  UPGRADE_DEFINITIONS.map((def) => {
    const locked = def.requiresIpo && !store.isIpoed
    const owned = store.upgrades.find((u) => u.definitionId === def.id)
    const level = owned?.level ?? 0
    const cost = store.getUpgradeCost(def.id)
    const canAfford = !locked && store.totalTypes >= cost
    const nextBonus = store.getUpgradeNextBonus(def.id)
    const totalBonus = store.getUpgradeTotalBonus(def.id)
    return { ...def, level, cost, canAfford, nextBonus, totalBonus, locked }
  })
)

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
  store.purchaseUpgrade(definitionId)
}

function purchaseFever(definitionId: string): void {
  store.purchaseFeverUpgrade(definitionId)
}
</script>

<template>
  <div class="upgrade-panel">
    <!-- タイピング強化 -->
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
        :class="{
          affordable: upgrade.canAfford,
          owned: upgrade.level > 0,
          locked: upgrade.locked,
        }"
        :disabled="!upgrade.canAfford"
        :aria-label="upgrade.locked
          ? '上場後に解放される'
          : `${upgrade.name}を購入 Lv.${upgrade.level} コスト${upgrade.cost}タイプ`"
        @click="purchase(upgrade.id)"
      >
        <template v-if="upgrade.locked">
          <span class="upgrade-icon locked-icon" aria-hidden="true">❓</span>
          <div class="upgrade-info">
            <span class="upgrade-name locked-text">？？？</span>
            <span class="upgrade-desc locked-text">上場後に解放</span>
          </div>
        </template>
        <template v-else>
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
        </template>
      </button>
    </div>

    <!-- フィーバー強化 -->
    <h2 class="panel-title fever-title">
      <span class="panel-icon" aria-hidden="true">🔥</span>
      フィーバー強化
      <span class="panel-hint">
        x{{ store.feverMultiplier }} / {{ store.feverDurationMs / 1000 }}秒
      </span>
    </h2>
    <div class="upgrade-list">
      <button
        v-for="fever in feverItems"
        :key="fever.id"
        class="upgrade-card fever-card"
        :class="{ affordable: fever.canAfford, owned: fever.level > 0 }"
        :disabled="!fever.canAfford"
        :aria-label="`${fever.name}を購入 Lv.${fever.level} コスト${fever.cost}タイプ`"
        @click="purchaseFever(fever.id)"
      >
        <span class="upgrade-icon" aria-hidden="true">{{ fever.icon }}</span>
        <div class="upgrade-info">
          <div class="upgrade-name-row">
            <span class="upgrade-name">{{ fever.name }}</span>
            <span class="upgrade-level fever-level" v-if="fever.level > 0">
              Lv.{{ fever.level }}
            </span>
          </div>
          <span class="upgrade-desc">{{ fever.description }}</span>
        </div>
        <span class="upgrade-cost" :class="{ affordable: fever.canAfford }">
          {{ formatNumber(fever.cost) }}
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

.fever-title {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
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

.upgrade-card.locked {
  opacity: 0.4;
  background: rgba(255, 255, 255, 0.02);
  border-style: dashed;
}

.upgrade-card.locked:hover {
  transform: none;
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.1);
}

.fever-card:hover:not(:disabled) {
  background: rgba(255, 165, 0, 0.1);
  border-color: rgba(255, 165, 0, 0.3);
}

.fever-card.affordable {
  border-color: rgba(255, 165, 0, 0.3);
}

.fever-card.owned {
  background: rgba(255, 165, 0, 0.05);
}

.upgrade-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.locked-icon {
  opacity: 0.5;
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

.locked-text {
  color: rgba(255, 255, 255, 0.3);
}

.upgrade-level {
  font-size: 0.7rem;
  font-weight: 700;
  color: #c084fc;
  background: rgba(123, 47, 247, 0.2);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

.fever-level {
  color: #fbbf24;
  background: rgba(255, 165, 0, 0.2);
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
