import { ACTION_TYPE, IOperationParams, STATUS } from '../interfaces';
import { logger } from '../logs';
import { checkStatus, confirmCallback, getActionByType, waitAction } from '../../operation-helpers';
import * as operationService from '../api';
import { EthMethods } from '../../blockchain-bridge/eth/EthMethods';
import { HmyMethods } from '../../blockchain-bridge/hmy/HmyMethods';

export const oneToEth = async (
  operationParams: IOperationParams,
  ethMethods: EthMethods,
  hmyMethods: HmyMethods,
  prefix
) => {
  let operation = await operationService.getOperation(operationParams.id);

  const approveHmyManger = getActionByType(operation, ACTION_TYPE.approveHmyManger);

  if (approveHmyManger && approveHmyManger.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'approveHmyManger' });

    await hmyMethods.approveHmyManger(operationParams.amount, hash =>
      confirmCallback(hash, approveHmyManger.type, operation.id)
    );

    logger.success({ prefix, message: 'approveHmyManger' });
  }

  operation = await operationService.getOperation(operationParams.id);

  const burnToken = getActionByType(operation, ACTION_TYPE.burnToken);

  if (burnToken && burnToken.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'burnToken' });

    await hmyMethods.burnToken(operationParams.ethAddress, operationParams.amount, hash =>
      confirmCallback(hash, burnToken.type, operation.id)
    );

    logger.success({ prefix, message: 'burnToken' });
  }

  const unlockToken = await waitAction(operationParams.id, ACTION_TYPE.unlockToken, prefix);

  if (!checkStatus(unlockToken, prefix, ACTION_TYPE.unlockToken)) {
    return false;
  }

  return true;
};
