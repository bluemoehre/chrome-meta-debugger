import { MetaItem } from 'types/Meta'

export type SeoRule = {
  tag: string
  key: string
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

export type SeoReport = Array<{
  severity: 'warning' | 'error'
  message: string
  rule: SeoRule
  meta: MetaItem | null
}>
