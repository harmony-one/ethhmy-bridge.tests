import { ACTION_TYPE, IOperationParams, STATUS } from '../utils/interfaces';
import { logger } from '../utils/logs';
import { checkStatus, confirmCallback, getActionByType, waitAction } from '../operation-helpers';
import * as operationService from '../utils/api';
import { sleep } from '../utils';
import { EthMethodsERC20 } from '../blockchain-bridge/eth/EthMethodsERC20';
import { HmyMethodsERC20 } from '../blockchain-bridge/hmy/HmyMethodsERC20';

export const ethToOneErc20 = async (
  operationParams: IOperationParams,
  ethMethods: EthMethodsERC20,
  hmyMethods: HmyMethodsERC20,
  prefix
) => {
  let operation = await operationService.getOperation(operationParams.id);

  let getHRC20Action = getActionByType(operation, ACTION_TYPE.getHRC20Address);

  if (getHRC20Action) {
    logger.wait({ prefix, message: 'getHRC20Address' });
  }

  while (getHRC20Action && [STATUS.IN_PROGRESS, STATUS.WAITING].includes(getHRC20Action.status)) {
    await sleep(3000);
    operation = await operationService.getOperation(operationParams.id);
    getHRC20Action = getActionByType(operation, ACTION_TYPE.getHRC20Address);
  }

  const erc20TokenDetails = await ethMethods.tokenDetails(operationParams.erc20Address);

  const approveEthManger = getActionByType(operation, ACTION_TYPE.approveEthManger);

  if (approveEthManger && approveEthManger.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'approveHmyManger' });

    const { amount, erc20Address } = operationParams;

    await ethMethods.approveEthManger(erc20Address, amount, erc20TokenDetails.decimals, hash =>
      confirmCallback(hash, approveEthManger.type, operationParams.id)
    );

    logger.success({ prefix, message: 'approveHmyManger' });
  }

  operation = await operationService.getOperation(operationParams.id);

  const lockToken = getActionByType(operation, ACTION_TYPE.lockToken);

  if (lockToken && lockToken.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'lockToken' });

    await ethMethods.lockToken(
      operationParams.erc20Address,
      operationParams.oneAddress,
      operationParams.amount,
      erc20TokenDetails.decimals,
      hash => confirmCallback(hash, lockToken.type, operationParams.id)
    );

    logger.success({ prefix, message: 'lockToken' });
  }

  const waitingBlockNumber = await waitAction(
    operationParams.id,
    ACTION_TYPE.waitingBlockNumber,
    300,
    prefix
  );

  if (!checkStatus(waitingBlockNumber, prefix, ACTION_TYPE.waitingBlockNumber)) {
    return false;
  }

  const mintToken = await waitAction(operationParams.id, ACTION_TYPE.mintToken, 30, prefix);

  if (!checkStatus(mintToken, prefix, ACTION_TYPE.mintToken)) {
    return false;
  }

  return true;
};
