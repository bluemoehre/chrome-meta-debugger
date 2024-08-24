import { Optional } from 'types/utils'
import { MetaIdent, MetaItem } from 'types/Meta'

type LooseMetaIdent = Optional<MetaIdent, 'key'>

export type Rule = LooseMetaIdent & {
  required?: boolean
  min?: number
  max?: number
  pattern?: { rx: RegExp; message: string }
  before?: LooseMetaIdent[]
  after?: LooseMetaIdent[]
  testFn?: () => {}
}

export type Violation = {
  severity: 'warning' | 'error'
  message: string
  rule: Rule
  meta: MetaItem | null
}
