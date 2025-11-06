/**
 * Rule: error-requires-err
 * Ensures error-level logs include an error object for proper stack trace logging
 */

function isLoggerErrorCall(node) {
  if (node.callee.type !== 'MemberExpression') return false

  const object = node.callee.object
  const property = node.callee.property

  if (object.type === 'Identifier' && (object.name === 'logger' || object.name === 'log')) {
    if (property.type === 'Identifier') {
      return property.name === 'error' || property.name === 'fatal'
    }
  }

  return false
}

function hasErrProperty(node) {
  if (!node || node.type !== 'ObjectExpression') return false

  return node.properties.some(prop => {
    if (prop.type === 'Property' && prop.key.type === 'Identifier') {
      return prop.key.name === 'err' || prop.key.name === 'error'
    }
    return false
  })
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require error object in error-level logs',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingErrObject: 'Error logs must include an { err } or { error } object for proper stack trace logging.',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (!isLoggerErrorCall(node)) return

        const firstArg = node.arguments[0]

        // If first argument is a string, definitely missing error object
        if (firstArg && firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
          context.report({
            node,
            messageId: 'missingErrObject',
          })
          return
        }

        // If first argument is an object, check if it has 'err' or 'error' property
        if (firstArg && firstArg.type === 'ObjectExpression') {
          if (!hasErrProperty(firstArg)) {
            context.report({
              node,
              messageId: 'missingErrObject',
            })
          }
        } else if (firstArg) {
          // First argument exists but is not an object or string
          // This is unusual but not necessarily wrong (could be a variable)
          // Skip reporting in this case
        } else {
          // No arguments at all
          context.report({
            node,
            messageId: 'missingErrObject',
          })
        }
      },
    }
  },
}
