require('./env');
import { config } from './testConfig';
import { logger } from './utils/logs';
import { operation } from './operation';
import { EXCHANGE_MODE, TOKEN } from './utils/interfaces';

const main = async () => {
  logger.start('E2E tests');

  config.accounts.forEach(async acc => {
    logger.info('Select eth account', acc.ethPK);

    logger.info('---------- BUSD: ETH_TO_ONE ---------');
    await operation(acc, TOKEN.BUSD, EXCHANGE_MODE.ETH_TO_ONE);
    logger.info('---------- BUSD: ONE_TO_ETH ---------');
    await operation(acc, TOKEN.BUSD, EXCHANGE_MODE.ONE_TO_ETH);
    logger.info('---------- LINK: ETH_TO_ONE ---------');
    await operation(acc, TOKEN.LINK, EXCHANGE_MODE.ETH_TO_ONE);
    logger.info('---------- LINK: ONE_TO_ETH ---------');
    await operation(acc, TOKEN.LINK, EXCHANGE_MODE.ONE_TO_ETH);
  });
};

main();
