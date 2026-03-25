/**
 * かな→ローマ字変換マップ
 * 各かなに対して許容されるローマ字入力パターンを配列で定義
 */

const ROMAJI_MAP: Record<string, string[]> = {
  // 基本母音
  'あ': ['a'], 'い': ['i'], 'う': ['u'], 'え': ['e'], 'お': ['o'],

  // か行
  'か': ['ka', 'ca'], 'き': ['ki'], 'く': ['ku', 'cu', 'qu'],
  'け': ['ke'], 'こ': ['ko', 'co'],

  // さ行
  'さ': ['sa'], 'し': ['si', 'shi', 'ci'],
  'す': ['su'], 'せ': ['se', 'ce'], 'そ': ['so'],

  // た行
  'た': ['ta'], 'ち': ['ti', 'chi'],
  'つ': ['tu', 'tsu'], 'て': ['te'], 'と': ['to'],

  // な行
  'な': ['na'], 'に': ['ni'], 'ぬ': ['nu'], 'ね': ['ne'], 'の': ['no'],

  // は行
  'は': ['ha'], 'ひ': ['hi'], 'ふ': ['hu', 'fu'],
  'へ': ['he'], 'ほ': ['ho'],

  // ま行
  'ま': ['ma'], 'み': ['mi'], 'む': ['mu'], 'め': ['me'], 'も': ['mo'],

  // や行
  'や': ['ya'], 'ゆ': ['yu'], 'よ': ['yo'],

  // ら行
  'ら': ['ra'], 'り': ['ri'], 'る': ['ru'], 'れ': ['re'], 'ろ': ['ro'],

  // わ行
  'わ': ['wa'], 'を': ['wo'], 'ん': ['nn', 'n\'', 'xn'],

  // が行
  'が': ['ga'], 'ぎ': ['gi'], 'ぐ': ['gu'], 'げ': ['ge'], 'ご': ['go'],

  // ざ行
  'ざ': ['za'], 'じ': ['zi', 'ji'],
  'ず': ['zu'], 'ぜ': ['ze'], 'ぞ': ['zo'],

  // だ行
  'だ': ['da'], 'ぢ': ['di'], 'づ': ['du'], 'で': ['de'], 'ど': ['do'],

  // ば行
  'ば': ['ba'], 'び': ['bi'], 'ぶ': ['bu'], 'べ': ['be'], 'ぼ': ['bo'],

  // ぱ行
  'ぱ': ['pa'], 'ぴ': ['pi'], 'ぷ': ['pu'], 'ぺ': ['pe'], 'ぽ': ['po'],

  // 拗音 - きゃ行
  'きゃ': ['kya'], 'きゅ': ['kyu'], 'きょ': ['kyo'],

  // 拗音 - しゃ行
  'しゃ': ['sya', 'sha'], 'しゅ': ['syu', 'shu'], 'しょ': ['syo', 'sho'],

  // 拗音 - ちゃ行
  'ちゃ': ['tya', 'cha', 'cya'], 'ちゅ': ['tyu', 'chu', 'cyu'], 'ちょ': ['tyo', 'cho', 'cyo'],

  // 拗音 - にゃ行
  'にゃ': ['nya'], 'にゅ': ['nyu'], 'にょ': ['nyo'],

  // 拗音 - ひゃ行
  'ひゃ': ['hya'], 'ひゅ': ['hyu'], 'ひょ': ['hyo'],

  // 拗音 - みゃ行
  'みゃ': ['mya'], 'みゅ': ['myu'], 'みょ': ['myo'],

  // 拗音 - りゃ行
  'りゃ': ['rya'], 'りゅ': ['ryu'], 'りょ': ['ryo'],

  // 拗音 - ぎゃ行
  'ぎゃ': ['gya'], 'ぎゅ': ['gyu'], 'ぎょ': ['gyo'],

  // 拗音 - じゃ行
  'じゃ': ['ja', 'zya', 'jya'], 'じゅ': ['ju', 'zyu', 'jyu'], 'じょ': ['jo', 'zyo', 'jyo'],

  // 拗音 - びゃ行
  'びゃ': ['bya'], 'びゅ': ['byu'], 'びょ': ['byo'],

  // 拗音 - ぴゃ行
  'ぴゃ': ['pya'], 'ぴゅ': ['pyu'], 'ぴょ': ['pyo'],

  // 外来語拗音
  'てぃ': ['thi', 'texi', 'teli'],
  'でぃ': ['dhi', 'dexi', 'deli'],
  'ふぁ': ['fa', 'huxa', 'hula'],
  'ふぃ': ['fi', 'huxi', 'huli'],
  'ふぇ': ['fe', 'huxe', 'hule'],
  'ふぉ': ['fo', 'huxo', 'hulo'],
  'うぇ': ['we', 'uxe', 'ule'],
  'うぃ': ['wi', 'uxi', 'uli'],
  'うぉ': ['who', 'uxo', 'ulo'],
  'つぁ': ['tsa'],
  'とぅ': ['twu', 'toxu', 'tolu'],
  'どぅ': ['dwu', 'doxu', 'dolu'],
  'ちぇ': ['che', 'tye', 'tile'],
  'しぇ': ['she', 'sye', 'sile'],
  'じぇ': ['je', 'zye', 'jile'],

  // 小文字
  'ぁ': ['xa', 'la'], 'ぃ': ['xi', 'li'], 'ぅ': ['xu', 'lu'],
  'ぇ': ['xe', 'le'], 'ぉ': ['xo', 'lo'],
  'っ': ['xtu', 'ltu', 'ltsu', 'xtsu'],
  'ゃ': ['xya', 'lya'], 'ゅ': ['xyu', 'lyu'], 'ょ': ['xyo', 'lyo'],

  // 記号
  'ー': ['-'], '。': ['.'], '、': [','],
}

/**
 * 「ん」が次の文字の前でn1回で入力可能かを判定
 * 次の文字がな行・母音・や行でなければn1回でOK
 */
function canSingleN(nextChar: string | undefined): boolean {
  if (!nextChar) return false
  const singleNBlockers = ['a', 'i', 'u', 'e', 'o', 'n', 'y']
  const nextPatterns = ROMAJI_MAP[nextChar]
  if (!nextPatterns) return false
  return nextPatterns.every(
    (pattern) => !singleNBlockers.includes(pattern[0])
  )
}

export interface RomajiSegment {
  kana: string
  patterns: string[]
}

/**
 * 表示テキスト（ひらがな/カタカナ）をローマ字セグメントに変換
 * 促音（っ）は次の子音を重ねる処理も含む
 */
export function toRomajiSegments(text: string): RomajiSegment[] {
  const katakanaToHiragana = (char: string): string => {
    const code = char.charCodeAt(0)
    if (code >= 0x30a1 && code <= 0x30f6) {
      return String.fromCharCode(code - 0x60)
    }
    return char
  }

  const hiragana = Array.from(text).map(katakanaToHiragana).join('')
  const segments: RomajiSegment[] = []
  let i = 0

  while (i < hiragana.length) {
    // 拗音チェック（2文字）
    if (i + 1 < hiragana.length) {
      const twoChar = hiragana.slice(i, i + 2)
      if (ROMAJI_MAP[twoChar]) {
        segments.push({ kana: twoChar, patterns: ROMAJI_MAP[twoChar] })
        i += 2
        continue
      }
    }

    const char = hiragana[i]

    // 促音処理
    if (char === 'っ') {
      const nextChar = hiragana[i + 1]
      if (nextChar) {
        // 次の文字（拗音含む）のパターンを取得
        let nextTwoChar = ''
        if (i + 2 < hiragana.length) {
          nextTwoChar = hiragana.slice(i + 1, i + 3)
        }
        const nextPatterns = ROMAJI_MAP[nextTwoChar] ?? ROMAJI_MAP[nextChar]
        if (nextPatterns) {
          // 次の子音の先頭1文字（次セグメントと合わせて子音が重なる）
          const doubledPatterns = nextPatterns
            .map((p) => p[0])
            .filter((p, idx, arr) => arr.indexOf(p) === idx)

          const basePatterns = ROMAJI_MAP['っ']
          segments.push({
            kana: 'っ',
            patterns: [...doubledPatterns, ...basePatterns],
          })
          i++
          continue
        }
      }
      segments.push({ kana: 'っ', patterns: ROMAJI_MAP['っ'] })
      i++
      continue
    }

    // 「ん」の処理
    if (char === 'ん') {
      const nextChar = hiragana[i + 1]
      const patterns = [...ROMAJI_MAP['ん']]
      if (canSingleN(nextChar)) {
        patterns.unshift('n')
      }
      segments.push({ kana: 'ん', patterns })
      i++
      continue
    }

    // 通常文字
    if (ROMAJI_MAP[char]) {
      segments.push({ kana: char, patterns: ROMAJI_MAP[char] })
    } else {
      // マップにない文字はそのまま
      segments.push({ kana: char, patterns: [char] })
    }
    i++
  }

  return segments
}
