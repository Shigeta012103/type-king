<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { PRESTIGE_UPGRADE_DEFINITIONS } from '../constants/prestigeUpgrades'

const store = useGameStore()
const confirmingSell = ref(false)

const upgradeItems = computed(() =>
  PRESTIGE_UPGRADE_DEFINITIONS.map((def) => {
    const owned = store.prestigeUpgrades.find((u) => u.definitionId === def.id)
    const purchased = owned?.purchased ?? false
    const canAfford = !purchased && store.availablePrestigePoints >= def.cost
    return { ...def, purchased, canAfford }
  })
)

const canPrestige = computed(() => store.potentialPrestigeLevel > 0)

const currentBonusPercent = computed(() => Math.round(store.prestigeLevel * 1))

const potentialBonusPercent = computed(() => Math.round(store.potentialPrestigeLevel * 1))

function purchaseUpgrade(upgradeId: string): void {
  store.purchasePrestigeUpgrade(upgradeId)
}

function handleSell(): void {
  if (!confirmingSell.value) {
    confirmingSell.value = true
    return
  }
  store.performPrestige()
  confirmingSell.value = false
}

function cancelSell(): void {
  confirmingSell.value = false
}
</script>

<template>
  <div class="prestige-panel">
    <!-- ステータス -->
    <div class="prestige-status">
      <div class="status-row">
        <span class="status-label">転生Lv</span>
        <span class="status-value prestige-level">{{ store.prestigeLevel }}</span>
      </div>
      <div class="status-row">
        <span class="status-label">所持pt</span>
        <span class="status-value prestige-points">{{ store.availablePrestigePoints }}</span>
      </div>
      <div class="status-row">
        <span class="status-label">転生回数</span>
        <span class="status-value">{{ store.prestigeCount }}</span>
      </div>
    </div>

    <!-- 受動ボーナス説明 -->
    <div class="passive-bonus">
      <div class="passive-header">
        <span class="passive-icon" aria-hidden="true">✨</span>
        <span class="passive-title">受動ボーナス</span>
      </div>
      <p class="passive-desc">
        転生レベル1につき全生産力+1%
      </p>
      <div class="passive-current" v-if="store.prestigeLevel > 0">
        現在: <span class="passive-value">+{{ currentBonusPercent }}%</span>
      </div>
    </div>

    <!-- 売却プレビュー -->
    <div class="sell-preview" :class="{ 'has-gain': store.newPointsOnSell > 0 }">
      <div class="preview-header">
        <span class="preview-icon" aria-hidden="true">💎</span>
        <span class="preview-title">売却した場合</span>
      </div>
      <div class="preview-details" v-if="canPrestige">
        <div class="preview-row">
          <span class="preview-label">獲得ポイント</span>
          <span class="preview-gain">+{{ store.newPointsOnSell }}pt</span>
        </div>
        <div class="preview-row">
          <span class="preview-label">転生Lv</span>
          <span class="preview-arrow">
            {{ store.prestigeLevel }} → {{ store.potentialPrestigeLevel }}
          </span>
        </div>
        <div class="preview-row">
          <span class="preview-label">受動ボーナス</span>
          <span class="preview-arrow">
            +{{ currentBonusPercent }}% → +{{ potentialBonusPercent }}%
          </span>
        </div>
      </div>
      <p class="preview-locked" v-else>
        通算10億タイプで転生が解放されます
      </p>
    </div>

    <!-- スキルツリー -->
    <h3 class="section-title">スキルツリー</h3>
    <div class="upgrade-list">
      <button
        v-for="upgrade in upgradeItems"
        :key="upgrade.id"
        class="prestige-card"
        :class="{
          purchased: upgrade.purchased,
          affordable: upgrade.canAfford,
        }"
        :disabled="!upgrade.canAfford"
        :aria-label="upgrade.purchased
          ? `${upgrade.name}（取得済み）`
          : `${upgrade.name}を取得 ${upgrade.cost}ポイント必要`"
        @click="purchaseUpgrade(upgrade.id)"
      >
        <span class="card-icon" aria-hidden="true">{{ upgrade.icon }}</span>
        <div class="card-info">
          <div class="card-name-row">
            <span class="card-name">{{ upgrade.name }}</span>
            <span class="card-badge" v-if="upgrade.purchased">取得済</span>
          </div>
          <span class="card-desc">{{ upgrade.description }}</span>
        </div>
        <span
          class="card-cost"
          :class="{ affordable: upgrade.canAfford, purchased: upgrade.purchased }"
          v-if="!upgrade.purchased"
        >
          {{ upgrade.cost }}pt
        </span>
      </button>
    </div>

    <!-- 売却ボタン -->
    <div class="sell-section">
      <div class="sell-confirm-area" v-if="confirmingSell">
        <p class="sell-warning">
          全てのエンジニア・アップグレード・タイプ数がリセットされます。<br>
          転生バフとスキルツリーは保持されます。
        </p>
        <div class="sell-buttons">
          <button
            class="sell-button confirm"
            :disabled="!canPrestige"
            aria-label="売却を確定する"
            @click="handleSell"
          >
            売却を確定する
          </button>
          <button
            class="sell-button cancel"
            aria-label="キャンセル"
            @click="cancelSell"
          >
            キャンセル
          </button>
        </div>
      </div>
      <button
        v-else
        class="sell-button primary"
        :class="{ disabled: !canPrestige }"
        :disabled="!canPrestige"
        aria-label="会社を売却して転生する"
        @click="handleSell"
      >
        <span class="sell-icon" aria-hidden="true">🔄</span>
        <div class="sell-info">
          <span class="sell-title">会社を売却して転生</span>
          <span class="sell-desc" v-if="canPrestige">
            +{{ store.newPointsOnSell }}ポイント獲得
          </span>
          <span class="sell-desc locked" v-else>
            通算10億タイプが必要
          </span>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.prestige-panel {
  /* パネル外枠はApp.vueのside-panelで管理 */
}

/* ステータス */
.prestige-status {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(167, 139, 250, 0.08);
  border: 1px solid rgba(167, 139, 250, 0.15);
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
  color: #a78bfa;
}

.prestige-level {
  color: #c084fc;
}

.prestige-points {
  color: #fbbf24;
}

/* 受動ボーナス */
.passive-bonus {
  padding: 0.6rem 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  margin-bottom: 0.75rem;
}

.passive-header {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.3rem;
}

.passive-icon {
  font-size: 0.85rem;
}

.passive-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
}

.passive-desc {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0 0 0.2rem;
}

.passive-current {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.passive-value {
  color: #4ade80;
  font-weight: 700;
}

/* 売却プレビュー */
.sell-preview {
  padding: 0.6rem 0.75rem;
  background: rgba(251, 191, 36, 0.04);
  border: 1px solid rgba(251, 191, 36, 0.1);
  border-radius: 10px;
  margin-bottom: 0.75rem;
}

.sell-preview.has-gain {
  border-color: rgba(251, 191, 36, 0.25);
  background: rgba(251, 191, 36, 0.08);
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.35rem;
}

.preview-icon {
  font-size: 0.85rem;
}

.preview-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
}

.preview-details {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.preview-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
}

.preview-label {
  color: rgba(255, 255, 255, 0.45);
}

.preview-gain {
  color: #fbbf24;
  font-weight: 700;
}

.preview-arrow {
  color: #4ade80;
  font-weight: 600;
}

.preview-locked {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.35);
  margin: 0;
}

/* セクションタイトル */
.section-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #c084fc;
  margin: 0 0 0.5rem;
}

/* アップグレードリスト */
.upgrade-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.prestige-card {
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

.prestige-card:hover:not(:disabled) {
  background: rgba(167, 139, 250, 0.1);
  border-color: rgba(167, 139, 250, 0.3);
  transform: translateY(-1px);
}

.prestige-card:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.prestige-card.affordable {
  border-color: rgba(167, 139, 250, 0.3);
}

.prestige-card.purchased {
  opacity: 0.6;
  background: rgba(167, 139, 250, 0.05);
  border-color: rgba(167, 139, 250, 0.2);
  cursor: default;
}

.card-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.card-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: 0.15rem;
}

.card-name-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-name {
  font-weight: 700;
  color: #fff;
  font-size: 0.95rem;
}

.card-badge {
  font-size: 0.65rem;
  font-weight: 700;
  color: #4ade80;
  background: rgba(74, 222, 128, 0.15);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

.card-desc {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
}

.card-cost {
  color: rgba(255, 100, 100, 0.8);
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.card-cost.affordable {
  color: #fbbf24;
}

.card-cost.purchased {
  display: none;
}

/* 売却セクション */
.sell-section {
  margin-top: 0.5rem;
}

.sell-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  border: none;
}

.sell-button.primary {
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
  border: 2px solid rgba(167, 139, 250, 0.4);
}

.sell-button.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(167, 139, 250, 0.3);
}

.sell-button.primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.15);
}

.sell-button.confirm {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  color: #fff;
}

.sell-button.confirm:hover:not(:disabled) {
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
}

.sell-button.cancel {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  justify-content: center;
  font-weight: 600;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.sell-button.cancel:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.sell-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.sell-info {
  display: flex;
  flex-direction: column;
}

.sell-title {
  font-weight: 800;
  font-size: 1rem;
  color: #fff;
}

.sell-desc {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.sell-desc.locked {
  color: rgba(255, 255, 255, 0.4);
}

.sell-warning {
  font-size: 0.75rem;
  color: rgba(255, 200, 100, 0.9);
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  margin: 0 0 0.5rem;
  line-height: 1.5;
}

.sell-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.sell-confirm-area {
  animation: fade-in 0.2s ease;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
