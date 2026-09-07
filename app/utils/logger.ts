type LogPayload = {
    action: string;
    userId?: string;
    metadata?: Record<string, any>;
    error?: any;
  };
  
  export const logger = {
    info: (message: string, payload?: LogPayload) => {
      console.info(JSON.stringify({ level: 'INFO', message, ...payload, timestamp: new Date().toISOString() }));
    },
    warn: (message: string, payload?: LogPayload) => {
      console.warn(JSON.stringify({ level: 'WARN', message, ...payload, timestamp: new Date().toISOString() }));
    },
    error: (message: string, payload?: LogPayload) => {
      console.error(JSON.stringify({ level: 'ERROR', message, ...payload, timestamp: new Date().toISOString() }));
    }
  };