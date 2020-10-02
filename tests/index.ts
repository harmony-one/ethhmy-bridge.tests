import { displayTotal } from './utils';

require('./env');
import { config } from './testConfig';
import { logger } from './utils/logs';
import { operation } from './operation';
import { EXCHANGE_MODE, TOKEN } from './utils/interfaces';
import { getWeb3Client } from './blockchain-bridge/eth';
import { getHmyClient } from './blockchain-bridge/hmy';
// import * as operationService from './utils/api';

const main = async () => {
  logger.start('E2E tests');

  config.accounts.forEach(async acc => {
    const web3Client = getWeb3Client(acc.ethPK);
    const hmyClient = await getHmyClient(acc.hmyPK);

    logger.note('test for ONE address: ', hmyClient.userAddress);
    logger.note('test for ETH address: ', web3Client.userAddress);

    // await operationService.mintTokens({ address: web3Client.userAddress, token: TOKEN.BUSD });
    // await operationService.mintTokens({ address: web3Client.userAddress, token: TOKEN.LINK });

    const timeBegin = Date.now();
    const total = [];
    let res;

    logger.note('---------- BUSD: ETH_TO_ONE ---------');
    res = await operation(web3Client, hmyClient, TOKEN.BUSD, EXCHANGE_MODE.ETH_TO_ONE, 1.12);
    total.push({ type: EXCHANGE_MODE.ETH_TO_ONE, token: TOKEN.BUSD, result: res });

    logger.note('---------- BUSD: ONE_TO_ETH ---------');
    res = await operation(web3Client, hmyClient, TOKEN.BUSD, EXCHANGE_MODE.ONE_TO_ETH, 1.12);
    total.push({ type: EXCHANGE_MODE.ONE_TO_ETH, token: TOKEN.BUSD, result: res });

    logger.note('---------- LINK: ETH_TO_ONE ---------');
    res = await operation(web3Client, hmyClient, TOKEN.LINK, EXCHANGE_MODE.ETH_TO_ONE, 1.12);
    total.push({ type: EXCHANGE_MODE.ETH_TO_ONE, token: TOKEN.LINK, result: res });

    logger.note('---------- LINK: ONE_TO_ETH ---------');
    res = await operation(web3Client, hmyClient, TOKEN.LINK, EXCHANGE_MODE.ONE_TO_ETH, 1.12);
    total.push({ type: EXCHANGE_MODE.ONE_TO_ETH, token: TOKEN.LINK, result: res });

    logger.note('---------- ERC20: ETH_TO_ONE ---------');
    res = await operation(
      web3Client,
      hmyClient,
      TOKEN.ERC20,
      EXCHANGE_MODE.ETH_TO_ONE,
      1000,
      config.erc20Address
    );
    total.push({ type: EXCHANGE_MODE.ETH_TO_ONE, token: TOKEN.ERC20, result: res });

    logger.note('---------- ERC20: ONE_TO_ETH ---------');
    res = await operation(
      web3Client,
      hmyClient,
      TOKEN.ERC20,
      EXCHANGE_MODE.ONE_TO_ETH,
      1000,
      config.erc20Address
    );
    total.push({ type: EXCHANGE_MODE.ONE_TO_ETH, token: TOKEN.ERC20, result: res });

    const timeLeft = (Date.now() - timeBegin) / 1000;

    logger.note('---------- // ---------');
    logger.note(`---------- time: ${timeLeft} sec ---------`);
    logger.note('---------- TOTAL ---------');
    displayTotal(total);
  });
};

main();
