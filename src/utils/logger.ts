type LogArgs = string | number | boolean | null | undefined | object;

export const logger = {
  info: (message: string, ...args: LogArgs[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(message, ...args)
    }
  },
  error: (message: string, error?: Error | unknown) => {
    console.error(message, error)
    // Aqui você pode adicionar integração com serviços de monitoramento
    // como Sentry, LogRocket, etc.
  }
} 