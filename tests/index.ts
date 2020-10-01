import { displayTotal } from './utils';

require('./env');
import { config } from './testConfig';
import { logger } from './utils/logs';
import { operation } from './operation';
import { EXCHANGE_MODE, TOKEN } from './utils/interfaces';

const main = async () => {
  logger.start('E2E tests');

  config.accounts.forEach(async acc => {
    logger.note('Select eth account', acc.ethPK);

    const total = [];
    let res;

    logger.note('---------- BUSD: ETH_TO_ONE ---------');
    res = await operation(acc, TOKEN.BUSD, EXCHANGE_MODE.ETH_TO_ONE);
    total.push({ type: EXCHANGE_MODE.ETH_TO_ONE, token: TOKEN.BUSD, result: res });

    logger.note('---------- BUSD: ONE_TO_ETH ---------');
    res = await operation(acc, TOKEN.BUSD, EXCHANGE_MODE.ONE_TO_ETH);
    total.push({ type: EXCHANGE_MODE.ONE_TO_ETH, token: TOKEN.BUSD, result: res });

    logger.note('---------- LINK: ETH_TO_ONE ---------');
    res = await operation(acc, TOKEN.LINK, EXCHANGE_MODE.ETH_TO_ONE);
    total.push({ type: EXCHANGE_MODE.ETH_TO_ONE, token: TOKEN.LINK, result: res });

    logger.note('---------- LINK: ONE_TO_ETH ---------');
    res = await operation(acc, TOKEN.LINK, EXCHANGE_MODE.ONE_TO_ETH);
    total.push({ type: EXCHANGE_MODE.ONE_TO_ETH, token: TOKEN.LINK, result: res });

    logger.note('---------- ERC20: ETH_TO_ONE ---------');
    res = await operation(acc, TOKEN.ERC20, EXCHANGE_MODE.ETH_TO_ONE, config.erc20Address);
    total.push({ type: EXCHANGE_MODE.ETH_TO_ONE, token: TOKEN.ERC20, result: res });

    logger.note('---------- ERC20: ONE_TO_ETH ---------');
    res = await operation(acc, TOKEN.ERC20, EXCHANGE_MODE.ONE_TO_ETH, config.erc20Address);
    total.push({ type: EXCHANGE_MODE.ONE_TO_ETH, token: TOKEN.ERC20, result: res });

    logger.note('---------- // ---------');
    logger.note('---------- TOTAL ---------');
    displayTotal(total);
  });
};

main();
