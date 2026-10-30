import {expect,it} from 'vitest'
import {analyse} from './learning'
it('gives distinct, sourced feedback for distinct answers',()=>{const a=analyse('A','这是过拟合，我会正则化并检查验证集');const b=analyse('B','训练和验证结果不同');expect(a.feedback).not.toBe(b.feedback);expect(a.source).toBe('current_local_session');expect(b.mode).toBe('rule_baseline')})
it('rejects empty evidence',()=>{expect(()=>analyse('A',' ')).toThrow('请先填写回答')})
