<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { ENGINEER_DEFINITIONS } from '../constants/engineers'
import { formatNumber } from '../utils/formatNumber'

const store = useGameStore()

const engineerItems = computed(() => {
  const summary = store.engineerBonusSummary
  return ENGINEER_DEFINITIONS.map((def) => {
    const locked = def.requiresIpo && !store.isIpoed
    const owned = store.engineers.find((e) => e.definitionId === def.id)
    const count = owned?.count ?? 0
    const cost = store.getEngineerCost(def.id)
    const canAfford = !locked && store.totalTypes >= cost
    const detail = summary.engineers.find((d) => d.definitionId === def.id)
    const synergyBonus = detail?.synergyBonus ?? 0
    const effectiveTps = detail?.effectiveTps ?? 0
    return { ...def, count, cost, canAfford, synergyBonus, effectiveTps, locked }
  })
})

const milestoneBonus = computed(() => store.engineerBonusSummary.milestoneBonus)
const milestoneCount = computed(() => store.engineerBonusSummary.milestoneCount)

function hire(definitionId: string): void {
  store.hireEngineer(definitionId)
}
</script>

<template>
  <div class="engineer-panel">
    <!-- マイルストーンボーナス表示 -->
    <div class="milestone-bar" v-if="milestoneCount > 0">
      <span class="milestone-icon" aria-hidden="true">🏆</span>
      <span class="milestone-text">
        マイルストーン {{ milestoneCount }}個達成
      </span>
      <span class="milestone-value">全体 +{{ Math.round(milestoneBonus * 100) }}%</span>
    </div>
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
              <span class="engineer-synergy" v-if="eng.synergyBonus > 0">
                +{{ Math.round(eng.synergyBonus * 100) }}%
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

.engineer-synergy {
  color: #fbbf24;
  font-weight: 700;
  font-size: 0.75rem;
}

.milestone-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 215, 0, 0.08);
  border: 1px solid rgba(255, 215, 0, 0.15);
  border-radius: 8px;
  margin-bottom: 0.75rem;
  font-size: 0.8rem;
}

.milestone-icon {
  font-size: 1rem;
}

.milestone-text {
  color: rgba(255, 255, 255, 0.6);
  flex: 1;
}

.milestone-value {
  color: #ffd700;
  font-weight: 700;
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
