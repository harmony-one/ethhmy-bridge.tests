import { logger } from './logs';

export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const displayTotal = arr => {
  arr.forEach(res => {
    if (res.result === true) {
      logger.success({
        prefix: `${res.accName} [${res.token.toUpperCase()}: ${res.type.toUpperCase()}]`,
        message: 'Success',
      });
    } else {
      logger.error({
        prefix: `${res.accName} [${res.token.toUpperCase()}: ${res.type.toUpperCase()}]`,
        message: 'Failed',
      });
    }
  });
};
