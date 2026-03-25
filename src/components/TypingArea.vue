<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useTypingEngine } from '../composables/useTypingEngine'

const store = useGameStore()
const {
  currentWord,
  displayRomaji,
  typedRomaji,
  handleKeyPress,
} = useTypingEngine((count: number) => store.addTypes(count))

function onKeyDown(event: KeyboardEvent): void {
  if (event.ctrlKey || event.altKey || event.metaKey) return
  if (event.key.length !== 1) return

  event.preventDefault()
  handleKeyPress(event.key.toLowerCase())
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <div class="typing-area">
    <div class="word-display">
      <span class="word-japanese">{{ currentWord.display }}</span>
    </div>
    <div class="romaji-display">
      <span class="romaji-typed">{{ typedRomaji }}</span>
      <span class="romaji-remaining">{{ displayRomaji }}</span>
      <span class="cursor" aria-hidden="true">|</span>
    </div>
    <p class="typing-hint">キーボードで入力してください</p>
  </div>
</template>

<style scoped>
.typing-area {
  padding: 2rem;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%);
  border-radius: 16px;
  border: 2px solid rgba(0, 210, 255, 0.3);
  text-align: center;
  box-shadow: 0 0 30px rgba(0, 210, 255, 0.1);
}

.word-display {
  margin-bottom: 1rem;
}

.word-japanese {
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.1em;
}

.romaji-display {
  font-size: 1.5rem;
  font-family: 'Courier New', monospace;
  min-height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.romaji-typed {
  color: #00d2ff;
  font-weight: 700;
}

.romaji-remaining {
  color: rgba(255, 255, 255, 0.4);
  font-weight: 400;
}

.cursor {
  color: #00d2ff;
  animation: blink 1s step-end infinite;
  font-weight: 300;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

.typing-hint {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.3);
}
</style>
