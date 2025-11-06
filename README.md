# eslint-plugin-pino-logging

ESLint plugin to enforce [Pino](https://getpino.io/) logging best practices with **snake_case** field naming convention.

## Features

- 🔒 **Security**: Prevents logging of sensitive data (passwords, tokens, API keys)
- 📊 **Structured Logging**: Enforces structured fields instead of string concatenation
- 🐛 **Error Tracking**: Requires error objects in error-level logs
- 🎨 **Consistency**: Enforces snake_case field naming
- 📝 **Clarity**: Requires message strings in all log calls

## Installation

```bash
npm install --save-dev eslint-plugin-pino-logging
```

## Usage

### Recommended Configuration

Add the plugin to your ESLint configuration:

```json
{
  "plugins": ["pino-logging"],
  "extends": ["plugin:pino-logging/recommended"]
}
```

This enables all recommended rules with snake_case field naming.

### Custom Configuration

```json
{
  "plugins": ["pino-logging"],
  "rules": {
    "pino-logging/no-sensitive-data": "error",
    "pino-logging/no-string-concat": "error",
    "pino-logging/error-requires-err": "error",
    "pino-logging/field-naming": ["error", { "convention": "snake_case" }],
    "pino-logging/requires-message": "error"
  }
}
```

## Rules

### `no-sensitive-data` (🔒 Security)

Prevents logging of sensitive information like passwords, tokens, and API keys.

❌ **Incorrect**:
```javascript
logger.info({ password: user.password }, 'login attempt')
logger.info({ api_key: config.apiKey }, 'api call')
logger.info({ credit_card: payment.card }, 'payment')
```

✅ **Correct**:
```javascript
logger.info({ user_id: user.id }, 'login attempt')
logger.info({ user_id: user.id }, 'api call')
logger.info({ payment_id: payment.id }, 'payment')
```

**Options**:
```json
{
  "pino-logging/no-sensitive-data": ["error", {
    "blockedFields": ["my_custom_secret"]
  }]
}
```

---

### `no-string-concat` (📊 Structured Logging)

Prevents string concatenation and template literals in log messages. Enforces structured logging with separate fields.

❌ **Incorrect**:
```javascript
logger.info('User ' + user_id + ' logged in')
logger.info(`User ${user_id} performed ${action}`)
```

✅ **Correct**:
```javascript
logger.info({ user_id }, 'user logged in')
logger.info({ user_id, action }, 'user action')
```

**Why**: Structured fields are queryable in log aggregation systems. String concatenation is not.

---

### `error-requires-err` (🐛 Error Tracking)

Ensures error-level logs include an error object for proper stack trace logging.

❌ **Incorrect**:
```javascript
logger.error('operation failed')
logger.error({ message: err.message }, 'operation failed')
```

✅ **Correct**:
```javascript
logger.error({ err }, 'operation failed')
logger.error({ err, user_id }, 'operation failed')
```

**Why**: Including the error object ensures full stack traces are logged for debugging.

---

### `field-naming` (🎨 Consistency)

Enforces consistent field naming convention. Defaults to `snake_case`.

❌ **Incorrect**:
```javascript
logger.info({ userId: 123, requestId: 'abc' }, 'action')  // camelCase
logger.info({ UserID: 123, REQUEST_ID: 'abc' }, 'action')  // UPPER_CASE
```

✅ **Correct**:
```javascript
logger.info({ user_id: 123, request_id: 'abc' }, 'action')  // snake_case
```

**Options**:
```json
{
  "pino-logging/field-naming": ["error", { "convention": "snake_case" }]
}
```

Available conventions: `snake_case` (default), `camelCase`

**Auto-fix**: This rule supports ESLint's `--fix` option to automatically convert camelCase to snake_case.

---

### `requires-message` (📝 Clarity)

Requires a message string in all log calls.

❌ **Incorrect**:
```javascript
logger.info({ user_id: 123 })  // Missing message
```

✅ **Correct**:
```javascript
logger.info({ user_id: 123 }, 'user action')
logger.info('user action')  // Message only is OK
```

---

## Standard Field Names (snake_case)

For consistency across services, use these standard field names:

| Field | Description |
|-------|-------------|
| `user_id` | User identifier |
| `request_id` | Request trace ID |
| `session_id` | Session identifier |
| `action` | User action or operation |
| `err` or `error` | Error object |
| `duration` | Operation duration in ms |
| `status_code` | HTTP status code |
| `method` | HTTP method |
| `path` | Request path |

## Complete Example

```javascript
import pino from 'pino'

const logger = pino({
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  }
})

// ✅ Good logging patterns
logger.info({ user_id: 123 }, 'user logged in')
logger.info({ user_id: 123, action: 'purchase', amount: 99.99 }, 'purchase completed')

try {
  await operation()
} catch (err) {
  logger.error({ err, user_id: 123 }, 'operation failed')
}

// Use child loggers for persistent context
const req_logger = logger.child({ request_id: req.id, user_id: req.user?.id })
req_logger.info('processing request')
req_logger.info('validating input')
```

## Related Documentation

- [Pino Logger Documentation](https://getpino.io/)
- [BetterStack Logging Conventions](https://github.com/Sceat/brain/blob/master/knowledge/betterstack-logging-conventions.md) (comprehensive guide)

## License

MIT

## Author

[Sceat](https://github.com/Sceat)
