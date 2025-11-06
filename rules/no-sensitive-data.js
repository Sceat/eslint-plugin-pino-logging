/**
 * Rule: no-sensitive-data
 * Prevents logging of sensitive information like passwords, tokens, API keys
 */

const SENSITIVE_FIELD_NAMES = [
  'password',
  'pwd',
  'passwd',
  'secret',
  'api_key',
  'apikey',
  'token',
  'access_token',
  'refresh_token',
  'jwt',
  'bearer',
  'auth',
  'authorization',
  'credit_card',
  'card_number',
  'cvv',
  'ssn',
  'private_key',
  'privatekey',
]

const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /key/i,
  /auth/i,
  /credential/i,
]

function isLoggerCall(node) {
  if (node.callee.type !== 'MemberExpression') return false

  const object = node.callee.object
  const property = node.callee.property

  // Check if object is named 'logger' or 'log'
  if (object.type === 'Identifier' && (object.name === 'logger' || object.name === 'log')) {
    // Check if method is a log method
    if (property.type === 'Identifier') {
      const logMethods = ['trace', 'debug', 'info', 'warn', 'error', 'fatal']
      return logMethods.includes(property.name)
    }
  }

  return false
}

function checkObjectForSensitiveData(node, context) {
  if (node.type !== 'ObjectExpression') return

  for (const prop of node.properties) {
    if (prop.type === 'Property' && prop.key.type === 'Identifier') {
      const keyName = prop.key.name.toLowerCase()

      // Check against exact matches
      if (SENSITIVE_FIELD_NAMES.includes(keyName)) {
        context.report({
          node: prop,
          message: `Sensitive field '${prop.key.name}' should not be logged. Use serializers to redact sensitive data.`,
        })
        continue
      }

      // Check against patterns
      for (const pattern of SENSITIVE_PATTERNS) {
        if (pattern.test(keyName)) {
          context.report({
            node: prop,
            message: `Potentially sensitive field '${prop.key.name}' detected. Use serializers if this contains sensitive data.`,
          })
          break
        }
      }
    }
  }
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent logging of sensitive information',
      category: 'Security',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          blockedFields: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {}
    const customBlockedFields = options.blockedFields || []

    // Add custom blocked fields to the list
    const allBlockedFields = [...SENSITIVE_FIELD_NAMES, ...customBlockedFields.map(f => f.toLowerCase())]

    return {
      CallExpression(node) {
        if (!isLoggerCall(node)) return

        // Check first argument (should be object with fields)
        const firstArg = node.arguments[0]
        if (firstArg && firstArg.type === 'ObjectExpression') {
          checkObjectForSensitiveData(firstArg, context)
        }
      },
    }
  },
}
