import { Optional } from 'types/utils'
import { MetaIdent, MetaItem } from 'types/Meta'

type TagIdent = Optional<MetaIdent, 'key'>

export type TagRule = TagIdent & {
  required?: boolean
  min?: number
  max?: number
  pattern?: { rx: RegExp; message: string }
  before?: TagIdent[]
  after?: TagIdent[]
  testFn?: () => {}
}

export type TagReport = Array<{
  severity: 'warning' | 'error'
  message: string
  rule: TagRule
  meta: MetaItem | null
}>
