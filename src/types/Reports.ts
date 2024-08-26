import { MetaItem } from 'types/Meta'
import { MetaRule, SeoRule, TagRule } from 'types/Rules'

export type ErrorSeverity = 'warning' | 'error'
export type ErrorMessage = string

export type TagReport = Array<{
  severity: ErrorSeverity
  message: ErrorMessage
  rule: TagRule
  meta: MetaItem | null
}>

export type MetaReport = Array<{
  severity: ErrorSeverity
  message: ErrorMessage
  rule: MetaRule
  meta: MetaItem | null
}>

export type SeoReport = Array<{
  severity: 'warning' | 'error'
  message: string
  rule: SeoRule
  meta: MetaItem | null
}>
