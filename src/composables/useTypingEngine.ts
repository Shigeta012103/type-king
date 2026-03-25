import { ref, computed } from 'vue'
import { WORD_LIST } from '../constants/words'
import { toRomajiSegments, type RomajiSegment } from '../utils/romajiMap'

export function useTypingEngine(onType: (count: number) => void) {
  const currentWord = ref(getRandomWord())
  const segments = ref<RomajiSegment[]>([])
  const currentSegmentIndex = ref(0)
  const currentInputInSegment = ref('')
  const completedRomaji = ref('')
  const totalTypedInWord = ref(0)

  function getRandomWord() {
    return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]
  }

  function initWord(): void {
    const word = getRandomWord()
    currentWord.value = word
    segments.value = toRomajiSegments(word.reading)
    currentSegmentIndex.value = 0
    currentInputInSegment.value = ''
    completedRomaji.value = ''
    totalTypedInWord.value = 0
  }

  // 表示用：現在のセグメントの推奨ローマ字
  const displayRomaji = computed(() => {
    return segments.value
      .map((seg, idx) => {
        if (idx < currentSegmentIndex.value) return ''
        if (idx === currentSegmentIndex.value) {
          const matching = seg.patterns.filter((p) =>
            p.startsWith(currentInputInSegment.value)
          )
          const best = matching[0] ?? seg.patterns[0]
          return best.slice(currentInputInSegment.value.length)
        }
        return seg.patterns[0]
      })
      .join('')
  })

  const typedRomaji = computed(() => {
    let result = ''
    for (let i = 0; i < currentSegmentIndex.value; i++) {
      const seg = segments.value[i]
      result += seg.patterns[0]
    }
    result += currentInputInSegment.value
    return result
  })

  function handleKeyPress(key: string): boolean {
    if (currentSegmentIndex.value >= segments.value.length) return false

    const testInput = currentInputInSegment.value + key
    const seg = segments.value[currentSegmentIndex.value]
    const matching = seg.patterns.filter((p) => p.startsWith(testInput))

    if (matching.length === 0) return false

    currentInputInSegment.value = testInput
    totalTypedInWord.value++
    onType(1)

    // セグメント完了チェック
    const exactMatch = matching.find((p) => p === testInput)
    if (exactMatch) {
      completedRomaji.value += exactMatch
      currentSegmentIndex.value++
      currentInputInSegment.value = ''

      // 全セグメント完了 → 次のワードへ
      if (currentSegmentIndex.value >= segments.value.length) {
        initWord()
      }
    }

    return true
  }

  // 初期化
  initWord()

  return {
    currentWord,
    segments,
    currentSegmentIndex,
    displayRomaji,
    typedRomaji,
    handleKeyPress,
    initWord,
  }
}
