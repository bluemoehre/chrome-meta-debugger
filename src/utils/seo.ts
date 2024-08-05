import { Meta, MetaItem } from 'types/Meta'
import { defaultSeoRules } from 'config/seo'

export type SeoRule = {
  tag: string
  key: string
  required?: boolean
  min?: number
  safe?: number
  max?: number

  // for technical checks
  // pattern?: { rx: RegExp; message: string }

  // for visual checks
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

export function validateSeo(meta: Meta, rules = defaultSeoRules): SeoReport {
  const issues: SeoReport = []

  for (const rule of rules) {
    const matchingMeta = meta.filter((item) => item.tag === rule.tag && item.key === rule.key)
    for (const item of matchingMeta) {
      if (rule.max && item.value.length > rule.max) {
        issues.push({
          severity: 'error',
          message: `${item.value.length} / ${rule.max} - maximum length exceeded`,
          rule,
          meta: item,
        })
      } else if (rule.safe && item.value.length > rule.safe) {
        issues.push({
          severity: 'warning',
          message: `${item.value.length} / ${rule.safe} - recommended length exceeded`,
          rule,
          meta: item,
        })
      } else if (rule.min && item.value.length < rule.min) {
        issues.push({
          severity: 'warning',
          message: `${item.value.length} / ${rule.min} - recommended length not reached`,
          rule,
          meta: item,
        })
      }
      // if (rule.pattern && !item.value.match(rule.pattern.rx)) {
      //   issues.push({
      //     severity: 'error',
      //     message: rule.pattern.message,
      //   })
      // }
    }
    if (!matchingMeta.length) {
      issues.push({
        severity: 'error',
        message: `${rule.tag.toUpperCase()}${rule.tag !== rule.key ? `:'${rule.key}'` : ''} is missing`,
        rule,
        meta: null,
      })
    }
  }

  return issues
}
