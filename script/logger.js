import log from 'https://cdn.skypack.dev/loglevel';
log.setLevel('info');
export const logger = {
  info: (...args) => log.info(...args),
  warn: (...args) => log.warn(...args),
  error: (...args) => log.error(...args),
  debug: (...args) => log.debug(...args),
};
