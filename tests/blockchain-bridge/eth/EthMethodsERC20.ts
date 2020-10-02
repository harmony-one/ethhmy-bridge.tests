import { Contract } from 'web3-eth-contract';
import { getAddress } from '@harmony-js/crypto';
import Web3 from 'web3';
import { withDecimals } from '../utils';
const BN = require('bn.js');

export interface IEthMethodsInitParams {
  web3: Web3;
  ethManagerContract: Contract;
  ethManagerAddress: string;
  userAddress: string;
}

export class EthMethodsERC20 {
  private web3: Web3;
  private ethManagerContract: Contract;
  private ethManagerAddress: string;
  private userAddress: string;

  constructor(params: IEthMethodsInitParams) {
    this.web3 = params.web3;
    this.ethManagerContract = params.ethManagerContract;
    this.ethManagerAddress = params.ethManagerAddress;
    this.userAddress = params.userAddress;
  }

  approveEthManger = async (erc20Address, amount, decimals, sendTxCallback?) => {
    const MyERC20Json = require('../out/MyERC20.json');
    const erc20Contract = new this.web3.eth.Contract(MyERC20Json.abi, erc20Address);

    await erc20Contract.methods
      .approve(this.ethManagerAddress, withDecimals(amount, decimals))
      .send({
        from: this.userAddress,
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', hash => sendTxCallback(hash));
  };

  lockToken = async (erc20Address, userAddr, amount, decimals, sendTxCallback?) => {
    const hmyAddrHex = getAddress(userAddr).checksum;

    const transaction = await this.ethManagerContract.methods
      .lockToken(erc20Address, withDecimals(amount, decimals), hmyAddrHex)
      .send({
        from: this.userAddress,
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', hash => sendTxCallback(hash));

    return transaction.events.Locked;
  };

  checkEthBalance = async (erc20Address, addr) => {
    const MyERC20Json = require('../out/MyERC20.json');
    const erc20Contract = new this.web3.eth.Contract(MyERC20Json.abi, erc20Address);

    return await erc20Contract.methods.balanceOf(addr).call();
  };

  tokenDetails = async erc20Address => {
    if (!this.web3.utils.isAddress(erc20Address)) {
      throw new Error('Invalid token address');
    }

    const MyERC20Json = require('../out/MyERC20.json');
    const erc20Contract = new this.web3.eth.Contract(MyERC20Json.abi, erc20Address);

    const name = await erc20Contract.methods.name().call();
    const symbol = await erc20Contract.methods.symbol().call();
    const decimals = await erc20Contract.methods.decimals().call();

    return { name, symbol, decimals, erc20Address };
  };
}
