import { it, expect } from 'vitest'
import { analyse as analyseNew } from './learning'
import { analyse as analyseOld } from './learning.baseline'

// 标注评测集：8 条人工标注的期望证据分层
const CASES: Array<[string, string, string]> = [
  ['S01', '这是过拟合，我会用正则化和交叉验证改进', 'T1_CONCEPT_WITH_ACTION'],
  ['S02', '我认为是过拟合', 'T2_CONCEPT_ONLY'],
  ['S03', '这可能是过拟合，但还没想好怎么改', 'T2_CONCEPT_ONLY'],
  ['S04', '训练和验证结果不同，差距很大', 'T3_GAP_OBSERVED'],
  ['S05', '训练准确率 99%，验证准确率 78%', 'T3_GAP_OBSERVED'],
  ['S06', '验证集准确率下降了10个百分点', 'T3_GAP_OBSERVED'],
  ['S07', '我用训练集训练了很多轮，模型应该没问题', 'T4_NO_EVIDENCE'],
  ['S08', '我喜欢猫和狗', 'T4_NO_EVIDENCE'],
]
const TIER_OF_OLD: Record<string, string> = {
  '已识别过拟合概念并已提出改进方向': 'T1_CONCEPT_WITH_ACTION',
  '已识别过拟合概念': 'T2_CONCEPT_ONLY',
  '已注意到训练与验证的差距': 'T3_GAP_OBSERVED',
  '尚未指出训练与验证差距': 'T4_NO_EVIDENCE',
}
it('改进前后对比评测', () => {
  let oldHit = 0, newHit = 0
  for (const [id, text, expected] of CASES) {
    const old = analyseOld('A', text)
    // 基线的 diagnosis 不区分 T1/T2，需结合 feedback 前缀还原分层
    let o = old.feedback.startsWith('你指出了过拟合并提出改进方向') ? 'T1_CONCEPT_WITH_ACTION' : TIER_OF_OLD[old.diagnosis]
    const n = analyseNew('A', text).tier
    if (o === expected) oldHit++
    if (n === expected) newHit++
    console.log(`${id} 期望=${expected} 基线=${o} ${o===expected?'✓':'✗'} 改进后=${n} ${n===expected?'✓':'✗'}`)
  }
  console.log(`基线准确率 ${oldHit}/8 = ${(oldHit/8*100).toFixed(1)}%  改进后 ${newHit}/8 = ${(newHit/8*100).toFixed(1)}%`)
  expect(newHit).toBe(8)
})
