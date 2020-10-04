import { ACTION_TYPE, IOperationParams, STATUS } from '../utils/interfaces';
import { logger } from '../utils/logs';
import { checkStatus, confirmCallback, getActionByType, waitAction } from '../operation-helpers';
import * as operationService from '../utils/api';
import { EthMethods } from '../blockchain-bridge/eth/EthMethods';
import { config } from '../testConfig';

export const ethToOne = async (
  operationParams: IOperationParams,
  ethMethods: EthMethods,
  prefix
) => {
  let operation = await operationService.getOperation(operationParams.id);

  const approveEthManger = getActionByType(operation, ACTION_TYPE.approveEthManger);

  if (approveEthManger && approveEthManger.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'approveEthManger' });

    await ethMethods.approveEthManger(operationParams.amount, hash =>
      confirmCallback(hash, approveEthManger.type, operation.id)
    );

    logger.success({ prefix, message: 'approveEthManger' });
  }

  operation = await operationService.getOperation(operationParams.id);

  const lockToken = getActionByType(operation, ACTION_TYPE.lockToken);

  if (lockToken && lockToken.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'lockToken' });

    await ethMethods.lockToken(operationParams.oneAddress, operationParams.amount, hash =>
      confirmCallback(hash, lockToken.type, operation.id)
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

  const mintToken = await waitAction(
    operationParams.id,
    ACTION_TYPE.mintToken,
    config.maxWaitingTime,
    prefix
  );

  if (!checkStatus(mintToken, prefix, ACTION_TYPE.mintToken)) {
    return false;
  }

  return true;
};
