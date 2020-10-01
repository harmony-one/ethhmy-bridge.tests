import signale from 'signale';
import { config } from '../testConfig';

export const logger = {
  error: (...args) => signale.error.apply(this, args),
  warning: (...args) => signale.warning.apply(this, args),
  start: (...args) => signale.start.apply(this, args),
  end: (...args) => signale.end.apply(this, args),
  success: (...args) => config.logLevel > 0 && signale.success.apply(this, args),
  info: (...args) => config.logLevel > 1 && signale.info.apply(this, args),
  pending: (...args) => config.logLevel > 1 && signale.pending.apply(this, args),
};
