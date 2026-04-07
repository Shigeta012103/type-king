<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { ENGINEER_DEFINITIONS } from '../constants/engineers'
import { MILESTONES, SYNERGY_PAIRS } from '../utils/engineerBonus'

const store = useGameStore()
const showSynergyList = ref(false)

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

    // このエンジニアが属するシナジーペア情報
    const synergies = SYNERGY_PAIRS
      .filter((p) => p.engineerA === def.id || p.engineerB === def.id)
      .map((pair) => {
        const partnerId = pair.engineerA === def.id ? pair.engineerB : pair.engineerA
        const partnerDef = ENGINEER_DEFINITIONS.find((d) => d.id === partnerId)
        const partnerCount = store.engineers.find((e) => e.definitionId === partnerId)?.count ?? 0
        return {
          name: pair.name,
          icon: pair.icon,
          partnerId,
          partnerName: partnerDef?.name ?? '',
          partnerIcon: partnerDef?.icon ?? '',
          partnerCount,
          receivedBonus: partnerCount * 0.5,
        }
      })

    const nextMilestone = MILESTONES.find((ms) => count < ms.threshold)

    return {
      ...def,
      count,
      cost,
      canAfford,
      synergyBonus,
      effectiveTps,
      locked,
      synergies,
      nextMilestone,
    }
  })
})

// シナジー一覧用データ
const synergyListItems = computed(() => {
  return SYNERGY_PAIRS.map((pair) => {
    const defA = ENGINEER_DEFINITIONS.find((d) => d.id === pair.engineerA)
    const defB = ENGINEER_DEFINITIONS.find((d) => d.id === pair.engineerB)
    const countA = store.engineers.find((e) => e.definitionId === pair.engineerA)?.count ?? 0
    const countB = store.engineers.find((e) => e.definitionId === pair.engineerB)?.count ?? 0
    return {
      ...pair,
      nameA: defA?.name ?? '',
      nameB: defB?.name ?? '',
      iconA: defA?.icon ?? '',
      iconB: defB?.icon ?? '',
      countA,
      countB,
      bonusToA: countB * 0.5,
      bonusToB: countA * 0.5,
    }
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
    <!-- ボーナス説明 -->
    <div class="bonus-guide">
      <div class="guide-header">
        <span class="guide-icon" aria-hidden="true">💡</span>
        <span class="guide-title">ボーナスシステム</span>
      </div>
      <div class="guide-row">
        <span class="guide-label">シナジー</span>
        <span class="guide-text">特定の組み合わせが互いのTPSを+0.5%/人</span>
      </div>
      <div class="guide-row">
        <span class="guide-label">マイルストーン</span>
        <span class="guide-text">25/50/100人到達で全体バフ</span>
      </div>
      <div class="milestone-bar" v-if="milestoneCount > 0">
        <span class="milestone-icon" aria-hidden="true">🏆</span>
        <span class="milestone-text">
          {{ milestoneCount }}個達成
        </span>
        <span class="milestone-value">全体 +{{ Math.round(milestoneBonus * 100) }}%</span>
      </div>
    </div>

    <!-- シナジー一覧（トグル） -->
    <button
      class="synergy-toggle"
      @click="showSynergyList = !showSynergyList"
      :aria-expanded="showSynergyList"
      aria-controls="synergy-list"
    >
      <span class="synergy-toggle-icon" aria-hidden="true">🔗</span>
      <span class="synergy-toggle-text">シナジー一覧</span>
      <span class="synergy-toggle-arrow" aria-hidden="true">{{ showSynergyList ? '▲' : '▼' }}</span>
    </button>
    <div
      v-if="showSynergyList"
      id="synergy-list"
      class="synergy-list"
    >
      <div
        v-for="syn in synergyListItems"
        :key="syn.name"
        class="synergy-list-item"
      >
        <div class="synergy-list-header">
          <span class="synergy-list-icon" aria-hidden="true">{{ syn.icon }}</span>
          <span class="synergy-list-name">{{ syn.name }}</span>
        </div>
        <div class="synergy-list-detail">
          <span class="synergy-list-pair">
            {{ syn.iconA }} {{ syn.nameA }}({{ syn.countA }})
            ⇄
            {{ syn.iconB }} {{ syn.nameB }}({{ syn.countB }})
          </span>
        </div>
        <div class="synergy-list-effects">
          <span class="synergy-list-effect" v-if="syn.bonusToA > 0 || syn.bonusToB > 0">
            <template v-if="syn.bonusToA > 0">
              {{ syn.nameA }}に+{{ Math.round(syn.bonusToA) }}%
            </template>
            <template v-if="syn.bonusToA > 0 && syn.bonusToB > 0"> / </template>
            <template v-if="syn.bonusToB > 0">
              {{ syn.nameB }}に+{{ Math.round(syn.bonusToB) }}%
            </template>
          </span>
          <span class="synergy-list-effect inactive" v-else>
            未発動
          </span>
        </div>
      </div>
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
          <!-- シナジーペア -->
          <div class="synergy-info" v-if="eng.synergies.length > 0">
            <div
              v-for="syn in eng.synergies"
              :key="syn.name"
              class="synergy-pair"
            >
              <span class="synergy-pair-icon" aria-hidden="true">{{ syn.icon }}</span>
              <span class="synergy-pair-name">{{ syn.name }}</span>
              <span class="synergy-pair-detail">
                <span class="synergy-received" v-if="syn.receivedBonus > 0">
                  {{ syn.partnerName }}{{ syn.partnerCount }}人→+{{ Math.round(syn.receivedBonus) }}%
                </span>
                <span class="synergy-gives">
                  雇うと{{ syn.partnerName }}に+0.5%
                </span>
              </span>
            </div>
          </div>
          <!-- 次のマイルストーン -->
          <div class="next-milestone" v-if="eng.nextMilestone && eng.count > 0">
            🏆 {{ eng.nextMilestone.threshold }}人で全体+{{ Math.round(eng.nextMilestone.globalBonus * 100) }}%
            <span class="milestone-progress">
              (あと{{ eng.nextMilestone.threshold - eng.count }}人)
            </span>
          </div>
          <div class="engineer-footer">
            <div class="engineer-tps-info">
              <span class="engineer-tps">{{ eng.typesPerSecond }}/秒</span>
              <span class="engineer-total-tps" v-if="eng.count > 0">
                計{{ store.fmt(eng.effectiveTps) }}/秒
              </span>
            </div>
            <span class="engineer-cost" :class="{ affordable: eng.canAfford }">
              {{ store.fmt(eng.cost) }} タイプ
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

.bonus-guide {
  margin-bottom: 0.75rem;
  padding: 0.6rem 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
}

.guide-header {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.4rem;
}

.guide-icon {
  font-size: 0.85rem;
}

.guide-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
}

.guide-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  margin-bottom: 0.2rem;
}

.guide-label {
  color: #fbbf24;
  font-weight: 700;
  flex-shrink: 0;
}

.guide-text {
  color: rgba(255, 255, 255, 0.45);
}

/* シナジー一覧トグル */
.synergy-toggle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.75rem;
  background: rgba(251, 191, 36, 0.06);
  border: 1px solid rgba(251, 191, 36, 0.15);
  border-radius: 8px;
  cursor: pointer;
  color: inherit;
  font-family: inherit;
  font-size: 0.8rem;
  transition: background 0.2s;
}

.synergy-toggle:hover {
  background: rgba(251, 191, 36, 0.12);
}

.synergy-toggle-icon {
  font-size: 0.85rem;
}

.synergy-toggle-text {
  color: #fbbf24;
  font-weight: 700;
  flex: 1;
  text-align: left;
}

.synergy-toggle-arrow {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.65rem;
}

/* シナジー一覧 */
.synergy-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  background: rgba(251, 191, 36, 0.04);
  border: 1px solid rgba(251, 191, 36, 0.1);
  border-radius: 8px;
}

.synergy-list-item {
  padding: 0.35rem 0.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
}

.synergy-list-header {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 0.15rem;
}

.synergy-list-icon {
  font-size: 0.75rem;
}

.synergy-list-name {
  font-size: 0.7rem;
  font-weight: 700;
  color: #fbbf24;
}

.synergy-list-detail {
  font-size: 0.65rem;
}

.synergy-list-pair {
  color: rgba(255, 255, 255, 0.5);
}

.synergy-list-effects {
  font-size: 0.65rem;
  margin-top: 0.1rem;
}

.synergy-list-effect {
  color: #4ade80;
  font-weight: 600;
}

.synergy-list-effect.inactive {
  color: rgba(255, 255, 255, 0.25);
  font-weight: 400;
}

/* カード内シナジー */
.synergy-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0 0.25rem;
}

.synergy-pair {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
  font-size: 0.65rem;
  flex-wrap: wrap;
}

.synergy-pair-icon {
  font-size: 0.7rem;
}

.synergy-pair-name {
  color: #fbbf24;
  font-weight: 700;
  flex-shrink: 0;
}

.synergy-pair-detail {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.synergy-received {
  color: #4ade80;
  font-weight: 600;
}

.synergy-gives {
  color: rgba(255, 255, 255, 0.35);
}

.next-milestone {
  font-size: 0.65rem;
  color: rgba(255, 215, 0, 0.7);
  padding: 0 0.25rem;
}

.milestone-progress {
  color: rgba(255, 255, 255, 0.35);
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
