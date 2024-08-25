import { Meta } from 'types/Meta'
import { TagReport } from 'types/Rules'
import { tagRules } from 'config/rules'

export function validateTags(meta: Meta, rules = tagRules): TagReport {
  const issues: TagReport = []

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
        } else if (rule.min && cleanValue.length < rule.min) {
          issues.push({
            severity: 'error',
            message: `${cleanValue.length} / ${rule.min} - minimum length not reached`,
            rule,
            meta: item,
          })
        }

        if (rule.pattern && !item.value.match(rule.pattern.rx)) {
          issues.push({
            severity: 'error',
            message: rule.pattern.message,
            rule,
            meta: item,
          })
        }

        if (rule.before) {
          const illicitPrevItems = rule.before
          console.log({ illicitPrevItems })

          const currentPrevItems = meta.slice(0, idx)
          console.log({ currentPrevItems })

          const violatingItems = currentPrevItems.filter((item) =>
            illicitPrevItems.some((illicit) => illicit.tag === item.tag && illicit.key === item.key)
          )
          console.log({ violatingItems })

          for (const { tag, key } of violatingItems) {
            issues.push({
              severity: 'error',
              message: `Element must not occur after ${tag === key ? tag : `${tag}:${key}`}`,
              rule,
              meta: item,
            })
          }
        }

        if (rule.after) {
          const illicitNextItems = rule.after
          console.log({ illicitNextItems })
          const currentNextItems = meta.slice(idx + 1)
          console.log({ currentNextItems })
          const violatingItems = currentNextItems.filter((item) =>
            illicitNextItems.some((illicit) => illicit.tag === item.tag && illicit.key === item.key)
          )
          console.log({ violatingItems })
          for (const { tag, key } of violatingItems) {
            issues.push({
              severity: 'error',
              message: `Element must not occur before ${tag === key ? tag : `${tag}:${key}`}`,
              rule,
              meta: item,
            })
          }
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
