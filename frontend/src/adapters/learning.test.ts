import { describe, expect, it } from 'vitest'
import { analyse, getEvidence, inspectAnswer, prompt, MAX_ANSWER_LENGTH } from './learning'

describe('Learning Agent 证据规则', () => {
  it('任务提示词包含可比较的训练与验证准确率', () => {
    expect(prompt).toContain('99%')
    expect(prompt).toContain('78%')
  })

  it('规则表覆盖概念、差异、数值与干预四类证据', () => {
    const ids = inspectAnswer('这是过拟合，训练 99% 与验证 78% 差距很大，我会用正则化和早停').map((h) => h.ruleId)
    expect(new Set(ids)).toEqual(new Set(['concept_overfitting', 'gap_marked', 'numbers_cited', 'intervention_action']))
  })

  it('命中记录保留原文与位置，可回溯到具体字词', () => {
    const hit = inspectAnswer('这是过拟合现象').find((h) => h.ruleId === 'concept_overfitting')
    expect(hit).toMatchObject({ matched: '过拟合', index: 2 })
  })
})

describe('错因分类：假阳性修复', () => {
  // 修复前：仅出现「训练」一词即被判为「已注意到训练与验证的差距」。
  it('只提到训练过程、未比较验证表现的回答不应判为已发现差距', () => {
    const record = analyse('A', '我用训练集训练了很多轮，模型应该没问题')
    expect(record.tier).toBe('T4_NO_EVIDENCE')
    // 未命中任何规则时不得由系统下结论，标记为需人工阅读。
    expect(record.hits).toHaveLength(0)
    expect(record.reviewRequired).toBe(true)
  })

  it('明确指出训练与验证差异的回答仍判为已发现差距', () => {
    const record = analyse('A', '训练和验证结果不同，差距很大')
    expect(record.tier).toBe('T3_GAP_OBSERVED')
    expect(record.hits.map((h) => h.ruleId)).toContain('gap_marked')
  })

  it('同时引用训练与验证数值的回答判为已发现差距', () => {
    const record = analyse('A', '训练准确率 99%，验证准确率 78%')
    expect(record.tier).toBe('T3_GAP_OBSERVED')
  })

  it('概念与干预齐备时进入最高证据层', () => {
    const record = analyse('A', '这是过拟合，我会用正则化和交叉验证改进')
    expect(record.tier).toBe('T1_CONCEPT_WITH_ACTION')
    expect(record.hits.length).toBeGreaterThanOrEqual(2)
  })
})

describe('输出契约与安全边界', () => {
  it('给出互不相同的可溯源反馈，并标注本地会话来源', () => {
    const a = analyse('A', '这是过拟合，我会正则化并检查验证集')
    const b = analyse('B', '训练和验证结果不同')
    expect(a.feedback).not.toBe(b.feedback)
    expect(a.source).toBe('current_local_session')
    expect(b.mode).toBe('rule_baseline')
  })

  it('不输出任何分数或等级字段', () => {
    const record = analyse('A', '训练 99% 验证 78%，可能是过拟合')
    expect(record).not.toHaveProperty('score')
    expect(record).not.toHaveProperty('grade')
    expect(record).not.toHaveProperty('rating')
  })

  it('拒绝对缺少全部证据的回答自动评价', () => {
    const record = analyse('A', '我喜欢猫和狗')
    expect(record.reviewRequired).toBe(true)
    expect(record.tier).toBe('T4_NO_EVIDENCE')
  })

  it('拒绝空回答与超长回答', () => {
    expect(() => analyse('A', ' ')).toThrow('请先填写回答')
    expect(() => analyse('A', '训'.repeat(MAX_ANSWER_LENGTH + 1))).toThrow(/长度/)
  })

  it('本机记录读取接口返回数组', () => {
    expect(Array.isArray(getEvidence())).toBe(true)
  })
})
