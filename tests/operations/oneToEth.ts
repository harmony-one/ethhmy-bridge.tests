import { ACTION_TYPE, IOperationParams, STATUS } from '../utils/interfaces';
import { logger } from '../utils/logs';
import { checkStatus, confirmCallback, getActionByType, waitAction } from '../operation-helpers';
import * as operationService from '../utils/api';
import { EthMethods } from '../blockchain-bridge/eth/EthMethods';
import { HmyMethods } from '../blockchain-bridge/hmy/HmyMethods';
import { config } from '../testConfig';

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

    const res: any = await hmyMethods.approveHmyManger(operationParams.amount, hash =>
      confirmCallback(hash, approveHmyManger.type, operation.id)
    );

    logger.info({ prefix, message: 'Status: ' + res.status });
    logger.success({ prefix, message: 'approveHmyManger' });
  }

  operation = await operationService.getOperation(operationParams.id);

  const burnToken = getActionByType(operation, ACTION_TYPE.burnToken);

  if (burnToken && burnToken.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'burnToken' });

    const res: any = await hmyMethods.burnToken(
      operationParams.ethAddress,
      operationParams.amount,
      hash => confirmCallback(hash, burnToken.type, operation.id)
    );

    logger.info({ prefix, message: 'Status: ' + res.status });
    logger.success({ prefix, message: 'burnToken' });
  }

  const waitingBlockNumberHarmony = await waitAction(
    operationParams.id,
    ACTION_TYPE.waitingBlockNumberHarmony,
    config.maxWaitingTime,
    prefix
  );

  if (!checkStatus(waitingBlockNumberHarmony, prefix, ACTION_TYPE.waitingBlockNumberHarmony)) {
    return false;
  }

  const unlockToken = await waitAction(
    operationParams.id,
    ACTION_TYPE.unlockToken,
    config.maxWaitingTime,
    prefix
  );

  if (!checkStatus(unlockToken, prefix, ACTION_TYPE.unlockToken)) {
    return false;
  }

  return true;
};
