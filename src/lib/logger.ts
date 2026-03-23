type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  [key: string]: unknown
}

function log(level: LogLevel, message: string, data?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...data,
  }

  if (process.env.NODE_ENV === 'production') {
    // JSON format for production (structured logs)
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](JSON.stringify(entry))
  } else {
    // Pretty format for development
    const prefix = { info: 'ℹ️', warn: '⚠️', error: '❌', debug: '🔍' }[level]
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
      `${prefix} [${entry.timestamp}] ${message}`,
      data ? data : ''
    )
  }
}

export const logger = {
  info: (msg: string, data?: Record<string, unknown>) => log('info', msg, data),
  warn: (msg: string, data?: Record<string, unknown>) => log('warn', msg, data),
  error: (msg: string, data?: Record<string, unknown>) => log('error', msg, data),
  debug: (msg: string, data?: Record<string, unknown>) => log('debug', msg, data),
}
