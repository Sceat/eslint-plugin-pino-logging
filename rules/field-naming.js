/**
 * Rule: field-naming
 * Enforces consistent field naming convention (snake_case by default)
 */

function isLoggerCall(node) {
  if (node.callee.type !== 'MemberExpression') return false

  const object = node.callee.object
  const property = node.callee.property

  if (object.type === 'Identifier' && (object.name === 'logger' || object.name === 'log')) {
    if (property.type === 'Identifier') {
      const logMethods = ['trace', 'debug', 'info', 'warn', 'error', 'fatal']
      return logMethods.includes(property.name)
    }
  }

  return false
}

function isSnakeCase(str) {
  // snake_case: lowercase with underscores
  return /^[a-z][a-z0-9_]*$/.test(str)
}

function isCamelCase(str) {
  // camelCase: starts lowercase, can have uppercase letters
  return /^[a-z][a-zA-Z0-9]*$/.test(str)
}

function isPascalCase(str) {
  // PascalCase: starts uppercase
  return /^[A-Z][a-zA-Z0-9]*$/.test(str)
}

function toSnakeCase(str) {
  // Convert camelCase/PascalCase to snake_case
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce consistent field naming convention in log objects',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          convention: {
            type: 'string',
            enum: ['snake_case', 'camelCase'],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      incorrectNaming: "Field '{{fieldName}}' should use {{convention}}. Suggestion: '{{suggestion}}'",
    },
  },

  create(context) {
    const options = context.options[0] || {}
    const convention = options.convention || 'snake_case'

    function checkNaming(fieldName) {
      if (convention === 'snake_case') {
        return isSnakeCase(fieldName)
      } else if (convention === 'camelCase') {
        return isCamelCase(fieldName)
      }
      return true
    }

    function getSuggestion(fieldName) {
      if (convention === 'snake_case') {
        return toSnakeCase(fieldName)
      }
      // For camelCase, we'd need a snake_case to camelCase converter
      // For now, just return the original
      return fieldName
    }

    return {
      CallExpression(node) {
        if (!isLoggerCall(node)) return

        const firstArg = node.arguments[0]
        if (!firstArg || firstArg.type !== 'ObjectExpression') return

        for (const prop of firstArg.properties) {
          if (prop.type === 'Property' && prop.key.type === 'Identifier') {
            const fieldName = prop.key.name

            // Skip standard fields that might come from serializers
            const standardFields = ['err', 'error', 'req', 'res', 'msg', 'time', 'level', 'pid', 'hostname']
            if (standardFields.includes(fieldName)) continue

            if (!checkNaming(fieldName)) {
              const suggestion = getSuggestion(fieldName)
              context.report({
                node: prop.key,
                messageId: 'incorrectNaming',
                data: {
                  fieldName,
                  convention,
                  suggestion,
                },
                fix(fixer) {
                  // Only provide auto-fix if suggestion is different and valid
                  if (suggestion !== fieldName && checkNaming(suggestion)) {
                    return fixer.replaceText(prop.key, suggestion)
                  }
                  return null
                },
              })
            }
          }
        }
      },
    }
  },
}
