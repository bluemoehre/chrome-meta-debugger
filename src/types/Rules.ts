import { Optional } from 'types/utils'
import { Meta, MetaIdent, MetaItem } from 'types/Meta'
import { ErrorMessage } from 'types/Reports'

type TagIdent = Optional<MetaIdent, 'key'>

export type TagRule = TagIdent & {
  required?: boolean
  min?: number
  max?: number
  pattern?: { rx: RegExp; message: ErrorMessage }
  before?: TagIdent[]
  after?: TagIdent[]
  testFn?: () => {}
}

export type MetaRule = MetaIdent & {
  required?: boolean
  min?: number
  max?: number
  pattern?: { rx: RegExp; message: ErrorMessage }
  testFn?: (item: MetaItem, meta: Meta, index: number) => ErrorMessage | undefined
}

export type SeoRule = MetaIdent & {
  required?: boolean
  min?: number
  safe?: number
  max?: number

  // TODO: add visual/render checks
  // config from Google Search (.MBeuO)
  // visual?: {
  //  maxWidth: 512px
  //  fontFamily: 'Arial, sans-serif',
  //  fontSize: 20px;
  //  fontWeight: 400;
  //}
}
