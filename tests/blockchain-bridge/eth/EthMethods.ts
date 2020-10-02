import { Contract } from 'web3-eth-contract';
import { getAddress } from '@harmony-js/crypto';
import Web3 from 'web3';
import { withDecimals } from '../utils';
const BN = require('bn.js');

export interface IEthMethodsInitParams {
  web3: Web3;
  ethManagerContract: Contract;
  ethManagerAddress: string;
  ethTokenContract: Contract;
  userAddress: string;
}

export class EthMethods {
  private web3: Web3;
  private ethManagerContract: Contract;
  private ethTokenContract: Contract;
  private ethManagerAddress: string;
  private userAddress: string;

  constructor(params: IEthMethodsInitParams) {
    this.web3 = params.web3;
    this.ethManagerContract = params.ethManagerContract;
    this.ethTokenContract = params.ethTokenContract;
    this.ethManagerAddress = params.ethManagerAddress;
    this.userAddress = params.userAddress;
  }

  approveEthManger = async (amount, sendTxCallback?) => {
    return await this.ethTokenContract.methods
      .approve(this.ethManagerAddress, withDecimals(amount, 18))
      .send({
        from: this.userAddress,
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', hash => sendTxCallback(hash));
  };

  lockToken = async (userAddr, amount, sendTxCallback?) => {
    const hmyAddrHex = getAddress(userAddr).checksum;

    const transaction = await this.ethManagerContract.methods
      .lockToken(withDecimals(amount, 18), hmyAddrHex)
      .send({
        from: this.userAddress,
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', hash => sendTxCallback(hash));

    return transaction.events.Locked;
  };

  checkEthBalance = async addr => {
    return await this.ethTokenContract.methods.balanceOf(addr).call();
  };
}
