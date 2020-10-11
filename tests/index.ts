import { displayTotal, sleep } from './utils';

require('./env');
import { config } from './testConfig';
import { logger } from './utils/logs';
import { operation } from './operation';
import { EXCHANGE_MODE, TOKEN } from './utils/interfaces';
import { getWeb3Client } from './blockchain-bridge/eth';
import { getHmyClient } from './blockchain-bridge/hmy';
// import * as operationService from './utils/api';

interface IAccount {
  ethPK: string;
  hmyPK: string;
  erc20Address?: string;
}

const total = [];

const createOperation = async (acc: IAccount, accName) => {
  const web3Client = getWeb3Client(acc.ethPK);
  const hmyClient = await getHmyClient(acc.hmyPK);

  logger.note('test for ONE address: ', hmyClient.userAddress);
  logger.note('test for ETH address: ', web3Client.userAddress);

  // await operationService.mintTokens({ address: web3Client.userAddress, token: TOKEN.BUSD });
  // await operationService.mintTokens({ address: web3Client.userAddress, token: TOKEN.LINK });

  let res;
  let i = config.testRepeats;

  while (i-- > 0) {
    logger.note('---------- BUSD: ETH_TO_ONE ---------');
    res = await operation(web3Client, hmyClient, TOKEN.BUSD, EXCHANGE_MODE.ETH_TO_ONE, 1.12);
    total.push({ accName, type: EXCHANGE_MODE.ETH_TO_ONE, token: TOKEN.BUSD, result: res });

    logger.note('---------- BUSD: ONE_TO_ETH ---------');
    res = await operation(web3Client, hmyClient, TOKEN.BUSD, EXCHANGE_MODE.ONE_TO_ETH, 1.12);
    total.push({ accName, type: EXCHANGE_MODE.ONE_TO_ETH, token: TOKEN.BUSD, result: res });

    logger.note('---------- LINK: ETH_TO_ONE ---------');
    res = await operation(web3Client, hmyClient, TOKEN.LINK, EXCHANGE_MODE.ETH_TO_ONE, 1.12);
    total.push({ accName, type: EXCHANGE_MODE.ETH_TO_ONE, token: TOKEN.LINK, result: res });

    logger.note('---------- LINK: ONE_TO_ETH ---------');
    res = await operation(web3Client, hmyClient, TOKEN.LINK, EXCHANGE_MODE.ONE_TO_ETH, 1.12);
    total.push({ accName, type: EXCHANGE_MODE.ONE_TO_ETH, token: TOKEN.LINK, result: res });

    if (acc.erc20Address) {
      logger.note('---------- ERC20: ETH_TO_ONE ---------');
      res = await operation(
        web3Client,
        hmyClient,
        TOKEN.ERC20,
        EXCHANGE_MODE.ETH_TO_ONE,
        100,
        acc.erc20Address
      );
      total.push({ accName, type: EXCHANGE_MODE.ETH_TO_ONE, token: TOKEN.ERC20, result: res });

      logger.note('---------- ERC20: ONE_TO_ETH ---------');
      res = await operation(
        web3Client,
        hmyClient,
        TOKEN.ERC20,
        EXCHANGE_MODE.ONE_TO_ETH,
        100,
        acc.erc20Address
      );
      total.push({ accName, type: EXCHANGE_MODE.ONE_TO_ETH, token: TOKEN.ERC20, result: res });
    }
  }
};

const main = async () => {
  logger.start('E2E tests');

  const timeBegin = Date.now();

  await Promise.all(
    config.accounts.map(async (acc, idx) => await createOperation(acc, String(idx)))
  );

  const timeLeft = (Date.now() - timeBegin) / 1000;

  logger.note('---------- // ---------');
  logger.note(`---------- time: ${timeLeft} sec ---------`);
  logger.note('---------- TOTAL ---------');
  displayTotal(total);
};

main();
