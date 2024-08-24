import { Meta } from 'types/Meta'
import { Violation } from 'types/Rules'
import { metaRules } from 'config/rules'

export function validateTags(metadata: Meta, rules = metaRules): Violation[] {
  const issues: Violation[] = []

  for (let i = 0; i < metadata.length; i++) {
    const item = metadata[i]

    for (const rule of rules) {
      let matchCount = 0

      if (item.tag === rule.tag && item.key === rule.key) {
        console.log('item:', item )

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

          const currentPrevItems = metadata.slice(0, i)
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
          const currentNextItems = metadata.slice(i + 1)
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

        matchCount++
      }

      if (rule.required && !matchCount) {
        issues.push({
          severity: 'error',
          message: 'Element is missing',
          rule,
          meta: null,
        })
      }
    }
  }

  return issues
}
