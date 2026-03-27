<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { ENGINEER_DEFINITIONS } from '../constants/engineers'
import { formatNumber } from '../utils/formatNumber'

const store = useGameStore()

function calcDigitBonus(count: number): number {
  if (count < 10) return 1
  const digits = Math.floor(Math.log10(count))
  return 1 + digits * 0.3
}

const engineerItems = computed(() =>
  ENGINEER_DEFINITIONS.map((def) => {
    const locked = def.requiresIpo && !store.isIpoed
    const owned = store.engineers.find((e) => e.definitionId === def.id)
    const count = owned?.count ?? 0
    const cost = store.getEngineerCost(def.id)
    const canAfford = !locked && store.totalTypes >= cost
    const digitBonus = calcDigitBonus(count)
    const effectiveTps = def.typesPerSecond * count * digitBonus
    return { ...def, count, cost, canAfford, digitBonus, effectiveTps, locked }
  })
)

function hire(definitionId: string): void {
  store.hireEngineer(definitionId)
}
</script>

<template>
  <div class="engineer-panel">
    <!-- タイトルはタブで表示 -->
    <div class="engineer-list">
      <button
        v-for="eng in engineerItems"
        :key="eng.id"
        class="engineer-card"
        :class="{
          affordable: eng.canAfford,
          owned: eng.count > 0,
          locked: eng.locked,
        }"
        :disabled="!eng.canAfford"
        :aria-label="eng.locked
          ? '上場後に解放される'
          : `${eng.name}を雇用 コスト${eng.cost}タイプ 現在${eng.count}人`"
        @click="hire(eng.id)"
      >
        <template v-if="eng.locked">
          <div class="engineer-header">
            <span class="engineer-icon locked-icon" aria-hidden="true">❓</span>
            <div class="engineer-info">
              <span class="engineer-name locked-text">？？？</span>
              <span class="engineer-desc locked-text">上場後に解放</span>
            </div>
          </div>
        </template>
        <template v-else>
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
            <div class="engineer-tps-info">
              <span class="engineer-tps">{{ eng.typesPerSecond }}/秒</span>
              <span class="engineer-bonus" v-if="eng.digitBonus > 1">
                x{{ eng.digitBonus.toFixed(1) }}
              </span>
              <span class="engineer-total-tps" v-if="eng.count > 0">
                計{{ formatNumber(eng.effectiveTps) }}/秒
              </span>
            </div>
            <span class="engineer-cost" :class="{ affordable: eng.canAfford }">
              {{ formatNumber(eng.cost) }} タイプ
            </span>
          </div>
        </template>
      </button>
    </div>
  </div>
</template>

<style scoped>
.engineer-panel {
  /* パネル外枠はApp.vueのside-panelで管理 */
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

.engineer-card.locked {
  opacity: 0.4;
  background: rgba(255, 255, 255, 0.02);
  border-style: dashed;
}

.engineer-card.locked:hover {
  transform: none;
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.1);
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

.locked-icon {
  opacity: 0.5;
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

.locked-text {
  color: rgba(255, 255, 255, 0.3);
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

.engineer-tps-info {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.engineer-tps {
  color: rgba(255, 255, 255, 0.5);
}

.engineer-bonus {
  color: #fbbf24;
  font-weight: 700;
  font-size: 0.75rem;
}

.engineer-total-tps {
  color: #00d2ff;
  font-size: 0.75rem;
}

.engineer-cost {
  color: rgba(255, 100, 100, 0.8);
  font-weight: 600;
}

.engineer-cost.affordable {
  color: #4ade80;
}
</style>
