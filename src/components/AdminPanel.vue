<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '../stores/gameStore'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const store = useGameStore()

const totalTypesInput = ref('')
const lifetimeTypesInput = ref('')
const currentRunTypesInput = ref('')
const prestigeCountInput = ref('')

function applyTotalTypes(): void {
  const value = Number(totalTypesInput.value)
  if (!isFinite(value) || value < 0) return
  store.adminSetTotalTypes(value)
  totalTypesInput.value = ''
}

function applyLifetimeTypes(): void {
  const value = Number(lifetimeTypesInput.value)
  if (!isFinite(value) || value < 0) return
  store.adminSetLifetimeTypes(value)
  lifetimeTypesInput.value = ''
}

function applyCurrentRunTypes(): void {
  const value = Number(currentRunTypesInput.value)
  if (!isFinite(value) || value < 0) return
  store.adminSetCurrentRunTypes(value)
  currentRunTypesInput.value = ''
}

function applyPrestigeCount(): void {
  const value = Number(prestigeCountInput.value)
  if (!isFinite(value) || value < 0) return
  store.adminSetPrestigeCount(value)
  prestigeCountInput.value = ''
}

function confirmAndRun(message: string, action: () => void): void {
  if (window.confirm(message)) action()
}

function close(): void {
  emit('close')
}
</script>

<template>
  <div
    v-if="open"
    class="admin-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="管理画面"
    @click.self="close"
  >
    <div class="admin-modal">
      <header class="admin-header">
        <h2 class="admin-title">
          <span aria-hidden="true">🔧</span> 管理画面
        </h2>
        <button class="close-button" aria-label="管理画面を閉じる" @click="close">
          ×
        </button>
      </header>

      <section class="admin-section">
        <h3 class="section-heading">現在の状態</h3>
        <dl class="status-grid">
          <dt>総タイプ数</dt>
          <dd>{{ store.fmt(store.totalTypes) }}</dd>
          <dt>累計タイプ数</dt>
          <dd>{{ store.fmt(store.lifetimeTypesEarned) }}</dd>
          <dt>このランの稼ぎ</dt>
          <dd>{{ store.fmt(store.currentRunTypesEarned) }}</dd>
          <dt>転生Lv</dt>
          <dd>{{ store.prestigeLevel }}</dd>
          <dt>所持Pt</dt>
          <dd>{{ store.availablePrestigePoints.toLocaleString() }}</dd>
          <dt>使用済みPt</dt>
          <dd>{{ store.spentPrestigePoints.toLocaleString() }}</dd>
          <dt>転生回数</dt>
          <dd>{{ store.prestigeCount }}</dd>
          <dt>上場済み</dt>
          <dd>{{ store.isIpoed ? 'はい' : 'いいえ' }}</dd>
        </dl>
      </section>

      <section class="admin-section">
        <h3 class="section-heading">値を変更</h3>
        <p class="section-note">
          累計タイプ数を下げると転生Lvと所持Ptも自動的に下がります
        </p>
        <div class="edit-row">
          <label for="total-types">総タイプ数</label>
          <input
            id="total-types"
            v-model="totalTypesInput"
            type="number"
            min="0"
            step="any"
            :placeholder="String(Math.floor(store.totalTypes))"
          />
          <button class="apply-button" @click="applyTotalTypes">適用</button>
        </div>
        <div class="edit-row">
          <label for="lifetime-types">累計タイプ数</label>
          <input
            id="lifetime-types"
            v-model="lifetimeTypesInput"
            type="number"
            min="0"
            step="any"
            :placeholder="String(Math.floor(store.lifetimeTypesEarned))"
          />
          <button class="apply-button" @click="applyLifetimeTypes">適用</button>
        </div>
        <div class="edit-row">
          <label for="current-run-types">このランの稼ぎ</label>
          <input
            id="current-run-types"
            v-model="currentRunTypesInput"
            type="number"
            min="0"
            step="any"
            :placeholder="String(Math.floor(store.currentRunTypesEarned))"
          />
          <button class="apply-button" @click="applyCurrentRunTypes">適用</button>
        </div>
        <div class="edit-row">
          <label for="prestige-count">転生回数</label>
          <input
            id="prestige-count"
            v-model="prestigeCountInput"
            type="number"
            min="0"
            step="1"
            :placeholder="String(store.prestigeCount)"
          />
          <button class="apply-button" @click="applyPrestigeCount">適用</button>
        </div>
      </section>

      <section class="admin-section">
        <h3 class="section-heading">リセット</h3>
        <div class="reset-buttons">
          <button
            class="reset-button"
            @click="confirmAndRun('スキルツリーの取得状態をリセットします。Pt は所持に戻ります。よろしいですか？', store.adminResetPrestigeUpgrades)"
          >
            スキルツリーをリセット
          </button>
          <button
            class="reset-button"
            @click="confirmAndRun('無限強化のレベルをリセットします。Pt は所持に戻ります。よろしいですか？', store.adminResetRepeatablePrestiges)"
          >
            無限強化をリセット
          </button>
          <button
            class="reset-button"
            @click="confirmAndRun('現在のラン（タイプ数・エンジニア・アップグレード）をリセットします。スキルツリーと無限強化は保持されます。よろしいですか？', store.adminResetCurrentRun)"
          >
            現在のランをリセット
          </button>
          <button
            class="reset-button danger"
            @click="confirmAndRun('全データをリセットします。すべて初期状態に戻ります。本当によろしいですか？', store.adminFullReset)"
          >
            全データリセット
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.admin-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.admin-modal {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 1.25rem;
  max-width: 540px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  color: #fff;
  font-family: inherit;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-title {
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.close-button {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2rem;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.admin-section {
  margin-bottom: 1.25rem;
}

.section-heading {
  font-size: 0.85rem;
  font-weight: 700;
  color: #c084fc;
  margin: 0 0 0.5rem;
}

.section-note {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0 0 0.5rem;
}

.status-grid {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.4rem 1rem;
  margin: 0;
  padding: 0.6rem 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  font-size: 0.8rem;
}

.status-grid dt {
  color: rgba(255, 255, 255, 0.5);
}

.status-grid dd {
  margin: 0;
  font-weight: 700;
  color: #fff;
  font-variant-numeric: tabular-nums;
}

.edit-row {
  display: grid;
  grid-template-columns: 7rem 1fr auto;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.4rem;
}

.edit-row label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.edit-row input {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: #fff;
  padding: 0.4rem 0.6rem;
  font-family: inherit;
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
  min-width: 0;
}

.edit-row input:focus {
  outline: none;
  border-color: #a78bfa;
}

.apply-button {
  background: rgba(167, 139, 250, 0.18);
  border: 1px solid rgba(167, 139, 250, 0.4);
  border-radius: 6px;
  color: #c084fc;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.75rem;
  padding: 0.4rem 0.75rem;
  cursor: pointer;
}

.apply-button:hover {
  background: rgba(167, 139, 250, 0.3);
}

.reset-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.reset-button {
  background: rgba(251, 191, 36, 0.08);
  border: 1px solid rgba(251, 191, 36, 0.25);
  border-radius: 8px;
  color: #fbbf24;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 0.6rem 0.75rem;
  cursor: pointer;
  text-align: left;
}

.reset-button:hover {
  background: rgba(251, 191, 36, 0.15);
  border-color: rgba(251, 191, 36, 0.4);
}

.reset-button.danger {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.reset-button.danger:hover {
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.5);
}
</style>
