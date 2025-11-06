/**
 * ESLint plugin for Pino logging best practices
 * Enforces snake_case field naming and security patterns
 */

const noSensitiveData = require('./rules/no-sensitive-data')
const noStringConcat = require('./rules/no-string-concat')
const errorRequiresErr = require('./rules/error-requires-err')
const fieldNaming = require('./rules/field-naming')
const requiresMessage = require('./rules/requires-message')

module.exports = {
  meta: {
    name: 'eslint-plugin-pino-logging',
    version: '1.0.0',
  },
  rules: {
    'no-sensitive-data': noSensitiveData,
    'no-string-concat': noStringConcat,
    'error-requires-err': errorRequiresErr,
    'field-naming': fieldNaming,
    'requires-message': requiresMessage,
  },
  configs: {
    recommended: {
      plugins: ['pino-logging'],
      rules: {
        'pino-logging/no-sensitive-data': 'error',
        'pino-logging/no-string-concat': 'error',
        'pino-logging/error-requires-err': 'error',
        'pino-logging/field-naming': ['error', { convention: 'snake_case' }],
        'pino-logging/requires-message': 'error',
      },
    },
  },
}
