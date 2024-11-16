import { Meta } from 'types/Meta'
import { SeoReport } from 'types/Reports'
import { defaultSeoRules } from 'config/rules/seo'

export function validateSeo(meta: Meta, rules = defaultSeoRules): SeoReport {
  const issues: SeoReport = []

  // iterate all meta items and check if each matches the related rules
  for (let idx = 0; idx < meta.length; idx++) {
    const item = meta[idx]

    for (const rule of rules) {
      if (item.tag === rule.tag && item.key === rule.key) {
        const cleanValue = item.value.trim()

        if (cleanValue.length < 1) {
          issues.push({
            severity: 'error',
            message: `Value is empty`,
            rule,
            meta: item,
          })
        } else if (rule.max && cleanValue.length > rule.max) {
          issues.push({
            severity: 'error',
            message: `${cleanValue.length} / ${rule.max} - maximum length exceeded`,
            rule,
            meta: item,
          })
        } else if (rule.safe && cleanValue.length > rule.safe) {
          issues.push({
            severity: 'warning',
            message: `${cleanValue.length} / ${rule.safe} - recommended length exceeded`,
            rule,
            meta: item,
          })
        } else if (rule.min && cleanValue.length < rule.min) {
          issues.push({
            severity: 'warning',
            message: `${cleanValue.length} / ${rule.min} - recommended length not reached`,
            rule,
            meta: item,
          })
        }
      }
    }
  }

  // find all missing meta items based on the rules
  for (const rule of rules) {
    if (rule.required && !meta.find((item) => item.tag === rule.tag && item.key === rule.key)) {
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
