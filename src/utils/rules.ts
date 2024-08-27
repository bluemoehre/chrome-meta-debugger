import { Meta } from 'types/Meta'
import { MetaReport } from 'types/Reports'
import { MetaRule } from 'types/Rules'

export function validateMeta(meta: Meta, rules: MetaRule[]): MetaReport {
  const issues: MetaReport = []

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

        if (rule.precedesAny) {
          const nextItem = meta[idx + 1]
          const mandatoryNextItems = rule.precedesAny
          if (!nextItem || !mandatoryNextItems.some(({ tag, key }) => tag === nextItem.tag && key === nextItem.key))
            issues.push({
              severity: 'error',
              message: `Element must precede one of ${mandatoryNextItems
                .map((item) => `${item.tag}:${item.key}`)
                .join(', ')}`,
              rule,
              meta: item,
            })
        }

        if (rule.followsAny) {
          const prevItem = meta[idx - 1]
          const mandatoryPrevItems = rule.followsAny

          if (!prevItem || !mandatoryPrevItems.some(({ tag, key }) => tag === prevItem.tag && key === prevItem.key))
            issues.push({
              severity: 'error',
              message: `Element must follow one of ${mandatoryPrevItems
                .map((item) => `${item.tag}:${item.key}`)
                .join(', ')}`,
              rule,
              meta: item,
            })
        }

        if (rule.beforeAll) {
          const prevItems = meta.slice(0, idx)
          const illegalPrevItems = rule.beforeAll
          const violatingItems = prevItems.filter((item) =>
            illegalPrevItems.some(({ tag, key }) => tag === item.tag && key === item.key)
          )

          for (const { tag, key } of violatingItems) {
            issues.push({
              severity: 'error',
              message: `Element must not occur after ${tag === key ? tag : `${tag}:${key}`}`,
              rule,
              meta: item,
            })
          }
        }

        if (rule.afterAll) {
          const nextItems = meta.slice(idx + 1)
          const illegalNextItems = rule.afterAll
          const violatingItems = nextItems.filter((item) =>
            illegalNextItems.some(({ tag, key }) => tag === item.tag && key === item.key)
          )
          for (const { tag, key } of violatingItems) {
            issues.push({
              severity: 'error',
              message: `Element must not occur before ${tag === key ? tag : `${tag}:${key}`}`,
              rule,
              meta: item,
            })
          }
        }

        if (rule.test) {
          const result = rule.test(item, meta, idx)
          if (result !== true) {
            issues.push({ ...result, rule, meta: item })
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
