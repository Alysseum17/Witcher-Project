export const withAuthProxy = (fn, opts) => {
  const {
    strategies,
    defaultStrategy,
    onRenew = async () => {},
    limiter = async () => {},
    logger = console,
  } = opts;

  if (!strategies || !strategies[defaultStrategy]) {
    throw new Error('withAuthProxy: Wrong defaultStrategy or empty strategies');
  }
  return async (url, config = {}) => {
    const name = config.strategy || defaultStrategy;
    const strat = strategies[name];
    if (!strat) {
      throw new Error(`withAuthProxy: Unknown strategy "${name}"`);
    }

    await limiter(config.userId || '');
    let auth = await strat(config);
    if (auth.renew) {
      try {
        await onRenew(name, config);
      } catch (err) {
        logger.error({ err, strategy: name }, 'proxy.onRenew error');
        throw err;
      }
      auth = await strat(config);
    }
    config.headers = {
      ...(config.headers || {}),
      ...(auth.headers || {}),
    };
    if (auth.qs) {
      const sep = url.includes('?') ? '&' : '?';
      url += sep + new URLSearchParams(auth.qs);
    }

    const time0 = Date.now();
    let res;
    try {
      res = await fn(url, config);
    } catch (err) {
      logger.error({ url, err }, 'proxy.call error');
      throw err;
    }

    if (res.status === 401) {
      try {
        await onRenew(name, config);
      } catch (renewErr) {
        logger.error({ err: renewErr, strategy: name }, 'proxy.onRenew error');
        throw renewErr;
      }
    }
    logger.info(
      {
        url,
        strategy: name,
        duration: Date.now() - time0,
        status: res.status ?? res.statusCode,
      },
      'proxy.call',
    );
    return res;
  };
};
