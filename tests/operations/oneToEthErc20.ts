import { ACTION_TYPE, IOperationParams, STATUS } from '../utils/interfaces';
import { logger } from '../utils/logs';
import { checkStatus, confirmCallback, getActionByType, waitAction } from '../operation-helpers';
import * as operationService from '../utils/api';
import { sleep } from '../utils';
import { EthMethodsERC20 } from '../blockchain-bridge/eth/EthMethodsERC20';
import { HmyMethodsERC20 } from '../blockchain-bridge/hmy/HmyMethodsERC20';
import { config } from '../testConfig';

export const oneToEthErc20 = async (
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

  const hrc20Address = await hmyMethods.getMappingFor(operationParams.erc20Address);

  if (!hrc20Address) {
    throw new Error('hrc20Address not found');
  }

  const approveHmyManger = getActionByType(operation, ACTION_TYPE.approveHmyManger);

  if (approveHmyManger && approveHmyManger.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'approveHmyManger' });

    const res: any = await hmyMethods.approveHmyManger(
      hrc20Address,
      operationParams.amount,
      erc20TokenDetails.decimals,
      hash => confirmCallback(hash, approveHmyManger.type, operationParams.id)
    );

    logger.info({ prefix, message: 'Status: ' + res.status });
    logger.success({ prefix, message: 'approveHmyManger' });
  }

  operation = await operationService.getOperation(operationParams.id);

  const burnToken = getActionByType(operation, ACTION_TYPE.burnToken);

  if (burnToken && burnToken.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'burnToken' });

    const res: any = await hmyMethods.burnToken(
      hrc20Address,
      operationParams.ethAddress,
      operationParams.amount,
      erc20TokenDetails.decimals,
      hash => confirmCallback(hash, burnToken.type, operationParams.id)
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
