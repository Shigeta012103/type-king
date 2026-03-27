<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from './stores/gameStore'
import { formatNumber } from './utils/formatNumber'
import ScoreDisplay from './components/ScoreDisplay.vue'
import TypingArea from './components/TypingArea.vue'
import EngineerPanel from './components/EngineerPanel.vue'
import UpgradePanel from './components/UpgradePanel.vue'
import FeverPanel from './components/FeverPanel.vue'

type SideTab = 'engineers' | 'upgrades' | 'fever'

const store = useGameStore()
const activeTab = ref<SideTab>('engineers')
const IPO_COST_DISPLAY = formatNumber(1_000_000_000)

function handleIpo(): void {
  store.doIpo()
}

onMounted(() => {
  store.loadGame()
  store.startAutoTick()
})

onUnmounted(() => {
  store.stopAutoTick()
  store.saveGame()
})
</script>

<template>
  <div class="game-container">
    <header class="game-header">
      <h1 class="game-title">
        <span class="title-icon" aria-hidden="true">⌨️</span>
        Type King
        <span class="ipo-badge" v-if="store.isIpoed">上場企業</span>
      </h1>
    </header>

    <main class="game-main">
      <div class="center-column">
        <ScoreDisplay />
        <TypingArea />

        <!-- 上場ボタン -->
        <button
          v-if="!store.isIpoed"
          class="ipo-button"
          :class="{ affordable: store.canIpo }"
          :disabled="!store.canIpo"
          aria-label="上場する（1Bタイプ必要）"
          @click="handleIpo"
        >
          <span class="ipo-icon" aria-hidden="true">🏢</span>
          <div class="ipo-info">
            <span class="ipo-title">株式上場（IPO）</span>
            <span class="ipo-desc">新たなエンジニアとアップグレードが解放される</span>
          </div>
          <span class="ipo-cost" :class="{ affordable: store.canIpo }">
            {{ IPO_COST_DISPLAY }} タイプ
          </span>
        </button>
      </div>

      <!-- サイドパネル（タブ式） -->
      <aside class="side-panel">
        <nav class="tab-bar" role="tablist" aria-label="サイドパネルタブ">
          <button
            role="tab"
            class="tab-button"
            :class="{ active: activeTab === 'engineers' }"
            :aria-selected="activeTab === 'engineers'"
            @click="activeTab = 'engineers'"
          >
            👥 雇用
          </button>
          <button
            role="tab"
            class="tab-button"
            :class="{ active: activeTab === 'upgrades' }"
            :aria-selected="activeTab === 'upgrades'"
            @click="activeTab = 'upgrades'"
          >
            ⬆️ 強化
          </button>
          <button
            role="tab"
            class="tab-button"
            :class="{ active: activeTab === 'fever' }"
            :aria-selected="activeTab === 'fever'"
            @click="activeTab = 'fever'"
          >
            🔥 FEVER
          </button>
        </nav>
        <div class="tab-content" role="tabpanel">
          <EngineerPanel v-show="activeTab === 'engineers'" />
          <UpgradePanel v-show="activeTab === 'upgrades'" />
          <FeverPanel v-show="activeTab === 'fever'" />
        </div>
      </aside>
    </main>
  </div>
</template>

<style scoped>
.game-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.game-header {
  text-align: center;
  padding: 0.75rem 0 1rem;
  flex-shrink: 0;
}

.game-title {
  font-size: 2rem;
  font-weight: 900;
  margin: 0;
  background: linear-gradient(135deg, #00d2ff, #7b2ff7, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.title-icon {
  -webkit-text-fill-color: initial;
  font-size: 1.75rem;
}

.ipo-badge {
  -webkit-text-fill-color: initial;
  font-size: 0.7rem;
  font-weight: 700;
  color: #ffd700;
  background: rgba(255, 215, 0, 0.15);
  border: 1px solid rgba(255, 215, 0, 0.3);
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
}

.game-main {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 1.5rem;
  align-items: start;
  flex: 1;
  min-height: 0;
}

.center-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* サイドパネル */
.side-panel {
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-height: calc(100vh - 5rem);
  overflow: hidden;
}

.tab-bar {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.tab-button {
  flex: 1;
  padding: 0.75rem 0.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  font-family: inherit;
  color: rgba(255, 255, 255, 0.4);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.tab-button:hover {
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.03);
}

.tab-button.active {
  color: #fff;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 15%;
  right: 15%;
  height: 2px;
  background: linear-gradient(90deg, #00d2ff, #7b2ff7);
  border-radius: 1px;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

/* 上場ボタン */
.ipo-button {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px dashed rgba(255, 215, 0, 0.2);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
}

.ipo-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ipo-button.affordable {
  border-style: solid;
  border-color: rgba(255, 215, 0, 0.5);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.1);
  animation: ipo-glow 2s ease-in-out infinite alternate;
}

.ipo-button.affordable:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 40px rgba(255, 215, 0, 0.2);
}

@keyframes ipo-glow {
  from { box-shadow: 0 0 20px rgba(255, 215, 0, 0.1); }
  to { box-shadow: 0 0 40px rgba(255, 215, 0, 0.25); }
}

.ipo-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.ipo-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.ipo-title {
  font-weight: 800;
  font-size: 1.1rem;
  color: #ffd700;
}

.ipo-desc {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.15rem;
}

.ipo-cost {
  font-weight: 700;
  font-size: 1rem;
  color: rgba(255, 100, 100, 0.8);
  flex-shrink: 0;
}

.ipo-cost.affordable {
  color: #ffd700;
}

@media (max-width: 900px) {
  .game-main {
    grid-template-columns: 1fr;
  }

  .side-panel {
    max-height: 50vh;
  }
}
</style>
