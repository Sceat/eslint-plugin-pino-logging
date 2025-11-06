/**
 * Rule: no-string-concat
 * Prevents string concatenation or template literals in log messages
 * Encourages structured logging with separate fields
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

function hasVariableInterpolation(node) {
  if (node.type === 'TemplateLiteral') {
    // Template literal with ${} expressions
    return node.expressions.length > 0
  }

  if (node.type === 'BinaryExpression' && node.operator === '+') {
    // String concatenation with +
    return true
  }

  return false
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow string concatenation in log messages',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noStringConcat: 'Use structured logging instead of string concatenation. Pass data as separate fields in an object.',
      noTemplateLiteral: 'Use structured logging instead of template literals. Pass variables as separate fields in an object.',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (!isLoggerCall(node)) return

        // Check each argument for string concatenation or template literals
        for (const arg of node.arguments) {
          if (arg.type === 'TemplateLiteral' && arg.expressions.length > 0) {
            context.report({
              node: arg,
              messageId: 'noTemplateLiteral',
            })
          }

          if (arg.type === 'BinaryExpression' && arg.operator === '+') {
            // Check if at least one side is a string or involves variables
            context.report({
              node: arg,
              messageId: 'noStringConcat',
            })
          }
        }
      },
    }
  },
}
