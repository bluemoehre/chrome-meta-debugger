import { MetaItem } from 'types/Meta'
import { MetaRule, SeoRule, Rule } from 'types/Rules'

export type Problem = { severity: ProblemSeverity; message: ProblemMessage }
export type ProblemSeverity = 'warning' | 'error'
export type ProblemMessage = string

export type Report = Array<{
  severity: ProblemSeverity
  message: ProblemMessage
  rule: Rule
  meta: MetaItem | null
}>

export type MetaReport = Array<{
  severity: ProblemSeverity
  message: ProblemMessage
  rule: MetaRule
  meta: MetaItem | null
}>

export type SeoReport = Array<{
  severity: 'warning' | 'error'
  message: string
  rule: SeoRule
  meta: MetaItem | null
}>
