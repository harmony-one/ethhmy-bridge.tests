import { ACTION_TYPE, IAction, IOperationParams, STATUS, TOKEN } from './utils/interfaces';
import { logger } from './utils/logs';
import * as operationService from './utils/api';
import { sleep } from './utils';
import { IWeb3Client } from './blockchain-bridge/eth';
import { IHmyClient } from './blockchain-bridge/hmy';

export const waitAction = async (
  operationId: string,
  actionType: ACTION_TYPE,
  prefix
): Promise<IAction> => {
  let operation = await operationService.getOperation(operationId);

  const getActionByType = (type: ACTION_TYPE) => operation.actions.find(a => a.type === type);

  let action = getActionByType(actionType);

  while (action.status === STATUS.IN_PROGRESS || action.status === STATUS.WAITING) {
    logger.info({ prefix, message: `waiting ${actionType}` });

    operation = await operationService.getOperation(operation.id);
    action = getActionByType(actionType);

    await sleep(3000);
  }

  return action;
};

export const checkStatus = (operation: { status: STATUS }, prefix, actionName) => {
  if (operation.status === STATUS.SUCCESS) {
    logger.success({ prefix, message: `${actionName} ${operation.status}` });

    return true;
  }

  if (operation.status === STATUS.ERROR) {
    logger.error({ prefix, message: `${actionName} ${operation.status}` });

    return false;
  }
};

export const getEthBalance = async (web3Client: IWeb3Client, token, erc20 = null) => {
  switch (token) {
    case TOKEN.BUSD:
      return await web3Client.ethMethodsBUSD.checkEthBalance(web3Client.userAddress);
    case TOKEN.LINK:
      return await web3Client.ethMethodsLINK.checkEthBalance(web3Client.userAddress);
    case TOKEN.ERC20:
      return await web3Client.ethMethodsERC20.checkEthBalance(erc20, web3Client.userAddress);
  }
};

export const getOneBalance = async (hmyClient: IHmyClient, token, erc20 = null) => {
  switch (token) {
    case TOKEN.BUSD:
      return await hmyClient.hmyMethodsBUSD.checkHmyBalance(hmyClient.userAddress);
    case TOKEN.LINK:
      return await hmyClient.hmyMethodsLINK.checkHmyBalance(hmyClient.userAddress);
    case TOKEN.ERC20:
      return await hmyClient.hmyMethodsERC20.checkHmyBalance(erc20, hmyClient.userAddress);
  }
};

export const logOperationParams = (operationParams: IOperationParams, prefix) => {
  logger.info({ prefix, message: 'ONE address: ' + operationParams.oneAddress });
  logger.info({ prefix, message: 'ETH address: ' + operationParams.ethAddress });

  logger.info({ prefix, message: 'Operation: ' + operationParams.type });
  logger.info({ prefix, message: 'Token: ' + operationParams.token });
  logger.info({ prefix, message: 'Amount: ' + operationParams.amount });
};

export const getActionByType = (operation, type: ACTION_TYPE) =>
  operation.actions.find(a => a.type === type);

export const confirmCallback = async (transactionHash, actionType: ACTION_TYPE, operationId) => {
  await operationService.confirmAction({
    operationId,
    transactionHash,
    actionType,
  });
};
