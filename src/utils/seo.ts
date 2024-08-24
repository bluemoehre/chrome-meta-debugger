import { Meta } from 'types/Meta'
import { SeoReport } from 'types/Seo'
import { defaultSeoRules } from 'config/seo'

export function validateSeo(meta: Meta, rules = defaultSeoRules): SeoReport {
  const issues: SeoReport = []

  for (const rule of rules) {
    const matchingMeta = meta.filter((item) => item.tag === rule.tag && item.key === rule.key)
    for (const item of matchingMeta) {
      const value = item.value.trim()
      if (value.length < 1) {
        issues.push({
          severity: 'error',
          message: `Value is empty`,
          rule,
          meta: item,
        })
      } else if (rule.max && value.length > rule.max) {
        issues.push({
          severity: 'error',
          message: `${value.length} / ${rule.max} - maximum length exceeded`,
          rule,
          meta: item,
        })
      } else if (rule.safe && value.length > rule.safe) {
        issues.push({
          severity: 'warning',
          message: `${value.length} / ${rule.safe} - recommended length exceeded`,
          rule,
          meta: item,
        })
      } else if (rule.min && value.length < rule.min) {
        issues.push({
          severity: 'warning',
          message: `${value.length} / ${rule.min} - recommended length not reached`,
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
    if (rule.required && !matchingMeta.length) {
      issues.push({
        severity: 'error',
        message: 'Element is missing',
        rule,
        meta: null,
      })
    }
  }

  return issues
}
