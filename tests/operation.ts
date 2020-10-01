import { logger } from './utils/logs';
import * as operationService from './utils/api';
import { uuid } from './utils/uuid';
import { EXCHANGE_MODE, IOperation, TOKEN } from './utils/interfaces';
import { getHmyClient } from './blockchain-bridge/hmy';
import { getWeb3Client } from './blockchain-bridge';
import { checkStatus, getEthBalance, getOneBalance, logOperationParams } from './operation-helpers';
import { ethToOne } from './operations/ethToOne';
import { oneToEth } from './operations/oneToEth';
import { oneToEthErc20 } from './operations/oneToEthErc20';
import { ethToOneErc20 } from './operations/ethToOneErc20';

export const operation = async (
  acc: { ethPK: string; hmyPK: string },
  token: TOKEN,
  type: EXCHANGE_MODE,
  erc20Address = ''
) => {
  const prefix = `[${token.toUpperCase()}: ${type.toUpperCase()}]`;

  try {
    logger.start({ prefix, message: `test ${token.toUpperCase()}: ${type.toUpperCase()}` });

    const web3Client = getWeb3Client(acc.ethPK);
    const hmyClient = getHmyClient(acc.hmyPK);

    const ethBalanceBefore = await getEthBalance(web3Client, token, erc20Address);
    const oneBalanceBefore = await getOneBalance(hmyClient, web3Client, token, erc20Address);

    const operationParams = {
      oneAddress: hmyClient.userAddress,
      ethAddress: web3Client.userAddress,
      amount: 1,
      type,
      token,
      erc20Address,
      id: uuid(),
    };

    logOperationParams(operationParams, prefix);

    logger.info({ prefix, message: 'ONE balance before: ' + oneBalanceBefore });
    logger.info({ prefix, message: 'ETH balance before: ' + ethBalanceBefore });

    logger.pending({ prefix, message: 'create operation' });

    let operation: IOperation;
    operation = await operationService.createOperation(operationParams);

    logger.success({ prefix, message: 'create operation' });
    logger.info({ prefix, message: 'operation ID: ' + operation.id });

    let ethMethods, hmyMethods;

    switch (token) {
      case TOKEN.BUSD:
        hmyMethods = hmyClient.hmyMethodsBUSD;
        ethMethods = web3Client.ethMethodsBUSD;
        break;
      case TOKEN.LINK:
        hmyMethods = hmyClient.hmyMethodsLINK;
        ethMethods = web3Client.ethMethodsLINK;
        break;
      case TOKEN.ERC20:
        hmyMethods = hmyClient.hmyMethodsERC20;
        ethMethods = web3Client.ethMethodsERC20;
        break;
    }

    let res = false;

    if (token === TOKEN.ERC20) {
      if (type === EXCHANGE_MODE.ETH_TO_ONE) {
        res = await ethToOneErc20(operationParams, ethMethods, hmyMethods, prefix);
      }

      if (type === EXCHANGE_MODE.ONE_TO_ETH) {
        res = await oneToEthErc20(operationParams, ethMethods, hmyMethods, prefix);
      }
    } else {
      if (type === EXCHANGE_MODE.ETH_TO_ONE) {
        res = await ethToOne(operationParams, ethMethods, prefix);
      }

      if (type === EXCHANGE_MODE.ONE_TO_ETH) {
        res = await oneToEth(operationParams, ethMethods, hmyMethods, prefix);
      }
    }

    if (!res) {
      return false;
    }

    operation = await operationService.getOperation(operation.id);

    if (!checkStatus(operation, prefix, 'operation')) {
      return false;
    }

    const ethBalanceAfter = await getEthBalance(web3Client, token, erc20Address);
    logger.info({ prefix, message: 'ETH balance before: ' + ethBalanceBefore });
    logger.info({ prefix, message: 'ETH balance after: ' + ethBalanceAfter });

    const ethBalanceWrong =
      type === EXCHANGE_MODE.ETH_TO_ONE
        ? Number(ethBalanceBefore) - Number(operationParams.amount) !== Number(ethBalanceAfter)
        : Number(ethBalanceBefore) + Number(operationParams.amount) !== Number(ethBalanceAfter);

    if (ethBalanceWrong) {
      logger.error({ prefix, message: 'Wrong ETH balance after' });
      return false;
    } else {
      logger.success({ prefix, message: 'ETH balance after OK' });
    }

    const oneBalanceAfter = await getOneBalance(hmyClient, web3Client, token, erc20Address);
    logger.info({ prefix, message: 'ONE balance before: ' + oneBalanceBefore });
    logger.info({ prefix, message: 'ONE balance after: ' + oneBalanceAfter });

    const oneBalanceWrong =
      type === EXCHANGE_MODE.ETH_TO_ONE
        ? Number(oneBalanceBefore) + Number(operationParams.amount) !== Number(oneBalanceAfter)
        : Number(oneBalanceBefore) - Number(operationParams.amount) !== Number(oneBalanceAfter);

    if (oneBalanceWrong) {
      logger.error({ prefix, message: 'Wrong ONE balance after' });
      return false;
    } else {
      logger.success({ prefix, message: 'ONE balance after OK' });
    }

    logger.success({ prefix, message: 'test OK' });

    return true;
  } catch (e) {
    let error;

    if (e && e.status && e.response.body) {
      error = e.response.body.message;
    } else {
      error = e ? e.message : 'unknown';
    }

    logger.error({ prefix, message: error });
  }
};
