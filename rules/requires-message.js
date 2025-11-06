/**
 * Rule: requires-message
 * Ensures all log calls include a message string
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

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require a message string in all log calls',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingMessage: 'Log calls must include a message string. Format: logger.{{method}}({ fields }, "message")',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (!isLoggerCall(node)) return

        const methodName = node.callee.property.name

        // Pino supports two formats:
        // 1. logger.info("message")
        // 2. logger.info({ fields }, "message")

        if (node.arguments.length === 0) {
          // No arguments at all
          context.report({
            node,
            messageId: 'missingMessage',
            data: { method: methodName },
          })
          return
        }

        if (node.arguments.length === 1) {
          const firstArg = node.arguments[0]

          // If only one argument and it's an object, missing message
          if (firstArg.type === 'ObjectExpression') {
            context.report({
              node,
              messageId: 'missingMessage',
              data: { method: methodName },
            })
          }

          // If only one argument and it's a string, that's OK (message only)
          // If it's a variable, we can't determine type, so allow it
        }

        // If 2+ arguments, assume format is correct (first is object, second is message)
        // We could add additional validation here, but it gets complex with variables
      },
    }
  },
}
