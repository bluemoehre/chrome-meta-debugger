import { Meta, MetaIdent, MetaItem, Tag, TagIdent } from 'types/Meta'
import { Problem, ProblemMessage } from 'types/Reports'

/** Rules identified by a unique ID */
export type RuleSet = { [id: string]: Rule }

export type Rule = {
  /** Tag name */
  tag: Tag
  /** Meta key */
  key?: string
  /** Mark item as mandatory */
  required?: boolean
  /** Custom test function */
  test?: (item: MetaItem, meta: Meta, index: number) => Problem | true
}

export type MetaRule = Rule & {
  /** Minimum value length */
  min?: number
  /** Maximum value length */
  max?: number
  /** Must match Regex */
  pattern?: { rx: RegExp; message: ProblemMessage }
  /** Must directly follow any of the given identities */
  followsAny?: Array<MetaIdent | TagIdent>
  /** Must directly precede any of the given identities */
  precedesAny?: Array<MetaIdent | TagIdent>
  /** Must be somewhere after all of the given identities */
  afterAll?: Array<MetaIdent | TagIdent>
  /** Must be somewhere before all of the given identities */
  beforeAll?: Array<MetaIdent | TagIdent>
}

export type SeoRule = Rule & {
  key: string
  /** Minimum recommended value length */
  min?: number
  /** Maximum safe value value length */
  safe?: number
  /** Maximum recommended value value length */
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
