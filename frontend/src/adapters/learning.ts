export type StudentId = 'A' | 'B'

/** 规则唯一标识：每条规则对应一类可测试的错因证据。 */
export type RuleId = 'concept_overfitting' | 'gap_marked' | 'numbers_cited' | 'intervention_action'

/** 单次规则命中记录：保留命中原文与位置，使诊断结论可回溯到具体字词。 */
export type RuleHit = { ruleId: RuleId; label: string; matched: string; index: number }

/**
 * 诊断分层。仅为「证据有无」的分层描述，不含分数、等级或对学生能力的评价。
 */
export type DiagnosisTier = 'T1_CONCEPT_WITH_ACTION' | 'T2_CONCEPT_ONLY' | 'T3_GAP_OBSERVED' | 'T4_NO_EVIDENCE'

export type EvidenceRecord = {
  id: string
  student: StudentId
  answer: string
  feedback: string
  diagnosis: string
  source: 'current_local_session'
  mode: 'rule_baseline'
  createdAt: string
  /** 触发本条诊断的全部规则命中，供师生逐条复核。 */
  hits: RuleHit[]
  tier: DiagnosisTier
  /** 规则未找到任何证据时必须转交人工阅读，禁止由系统给出评价结论。 */
  reviewRequired: boolean
}

const KEY = 'mindtrace-demo-evidence-v1'
export const MAX_ANSWER_LENGTH = 2000

export const prompt = '猫狗分类模型训练准确率 99%，验证准确率 78%。你认为发生了什么？如何确认并改进？'

/** 规则定义表：集中声明，便于单独测试、增删与审计。 */
export const RULE_DEFS: ReadonlyArray<{ ruleId: RuleId; label: string; pattern: RegExp }> = [
  { ruleId: 'concept_overfitting', label: '指出过拟合概念', pattern: /过拟合|over-?fit/i },
  { ruleId: 'gap_marked', label: '指出两者表现存在差异', pattern: /差距|不一致|不同|低于|高于|落差|下降|下滑/ },
  { ruleId: 'numbers_cited', label: '引用了具体数值', pattern: /\d{1,3}\s*%/ },
  { ruleId: 'intervention_action', label: '提出可检验的干预措施', pattern: /增强|扩增|正则|早停|交叉验证|更多数据|简化|dropout|检查/ }
]

const SIDE_PATTERN = /训练|验证|测试|train|vali/i

/** 纯函数：返回文本命中的所有规则证据，不产生任何诊断或评价。 */
export function inspectAnswer(text: string): RuleHit[] {
  const hits: RuleHit[] = []
  for (const def of RULE_DEFS) {
    const match = def.pattern.exec(text)
    if (match) hits.push({ ruleId: def.ruleId, label: def.label, matched: match[0], index: match.index })
  }
  return hits
}

function hasRule(hits: RuleHit[], id: RuleId): boolean {
  return hits.some((h) => h.ruleId === id)
}

/**
 * 判断回答是否真正指向「训练—验证」对比。
 * 条件为：显式差异词作用于训练/验证两侧，或同时引用了训练与验证的数值。
 * 仅出现「训练」等单词不足以构成证据。
 */
function observedGap(text: string, hits: RuleHit[]): boolean {
  const marked = hasRule(hits, 'gap_marked') && SIDE_PATTERN.test(text)
  const numeric = hasRule(hits, 'numbers_cited') && /训练|train/i.test(text) && /验证|测试|vali/i.test(text)
  return marked || numeric
}

export function analyse(student: StudentId, answer: string): EvidenceRecord {
  const text = answer.trim()
  if (!text) throw new Error('请先填写回答')
  if (text.length > MAX_ANSWER_LENGTH) throw new Error(`回答长度超过 ${MAX_ANSWER_LENGTH} 字限制`)

  const hits = inspectAnswer(text)
  const concept = hasRule(hits, 'concept_overfitting')
  const action = hasRule(hits, 'intervention_action')
  const gap = observedGap(text, hits)

  let tier: DiagnosisTier
  let diagnosis: string
  let feedback: string

  if (concept && action) {
    tier = 'T1_CONCEPT_WITH_ACTION'
    diagnosis = '已识别过拟合并提出改进方向'
    feedback = '你指出了过拟合概念并提出了可检验的干预。下一步请说明如何用独立验证集比较干预前后的表现差异。'
  } else if (concept) {
    tier = 'T2_CONCEPT_ONLY'
    diagnosis = '已识别过拟合概念'
    feedback = '你识别了过拟合。请再提出至少一项可检验的干预，并说明验证方式。'
  } else if (gap) {
    tier = 'T3_GAP_OBSERVED'
    diagnosis = '已注意到训练与验证的差距'
    feedback = '你观察到了两个数据集上的表现差异。试着用“过拟合”和“泛化”解释这组数字，再提出验证办法。'
  } else {
    tier = 'T4_NO_EVIDENCE'
    diagnosis = '尚未指出训练与验证差距'
    feedback = '先比较训练 99% 与验证 78%：模型在未见数据上表现如何？请说明可能原因。'
  }

  return {
    id: crypto.randomUUID(),
    student,
    answer: text,
    feedback,
    diagnosis,
    source: 'current_local_session',
    mode: 'rule_baseline',
    createdAt: new Date().toISOString(),
    hits,
    tier,
    reviewRequired: hits.length === 0
  }
}

export function getEvidence(): EvidenceRecord[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') as EvidenceRecord[] } catch { return [] }
}
export function saveEvidence(record: EvidenceRecord) {
  localStorage.setItem(KEY, JSON.stringify([record, ...getEvidence()].slice(0, 100)))
}
export function clearEvidence() { localStorage.removeItem(KEY) }
