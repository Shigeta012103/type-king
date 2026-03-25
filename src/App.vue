<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useGameStore } from './stores/gameStore'
import ScoreDisplay from './components/ScoreDisplay.vue'
import TypingArea from './components/TypingArea.vue'
import EngineerPanel from './components/EngineerPanel.vue'
import UpgradePanel from './components/UpgradePanel.vue'

const store = useGameStore()

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
      </h1>
    </header>

    <main class="game-main">
      <div class="center-column">
        <ScoreDisplay />
        <TypingArea />
      </div>
      <aside class="side-column">
        <EngineerPanel />
        <UpgradePanel />
      </aside>
    </main>
  </div>
</template>

<style scoped>
.game-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  min-height: 100vh;
}

.game-header {
  text-align: center;
  padding: 1rem 0 1.5rem;
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

.game-main {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 1.5rem;
  align-items: start;
}

.center-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.side-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (max-width: 900px) {
  .game-main {
    grid-template-columns: 1fr;
  }
}
</style>
