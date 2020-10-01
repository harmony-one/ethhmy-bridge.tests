import { Harmony } from '@harmony-js/core';
import { Contract } from '@harmony-js/contract';

interface IHmyMethodsInitParams {
  hmy: Harmony;
  hmyManagerContract: Contract;
  options?: { gasPrice: number; gasLimit: number };
  userAddress: string;
}

export class HmyMethodsERC20 {
  private hmy: Harmony;
  private hmyManagerContract: Contract;
  private options = { gasPrice: 1000000000, gasLimit: 6721900 };
  private userAddress: string;

  constructor(params: IHmyMethodsInitParams) {
    this.hmy = params.hmy;
    this.hmyManagerContract = params.hmyManagerContract;
    this.userAddress = params.userAddress;

    if (params.options) {
      this.options = params.options;
    }
  }

  approveHmyManger = (hrc20Address, amount, decimals, sendTxCallback?) => {
    const tokenJson = require('../out/MyERC20.json');
    const hmyTokenContract = this.hmy.contracts.createContract(tokenJson.abi, hrc20Address);

    return new Promise(async (resolve, reject) => {
      try {
        // TODO
        // await connectToOneWallet(hmyTokenContract.wallet, null, reject);

        const res = await hmyTokenContract.methods
          .approve(this.hmyManagerContract.address, String(amount * Number('1e' + decimals)))
          .send(this.options)
          .on('transactionHash', sendTxCallback);

        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  };

  burnToken = async (hrc20Address, userAddr, amount, decimals, sendTxCallback?) => {
    return new Promise(async (resolve, reject) => {
      try {
        // await connectToOneWallet(this.hmyManagerContract.wallet, null, reject);

        const response = await this.hmyManagerContract.methods
          .burnToken(hrc20Address, String(amount * Number('1e' + decimals)), userAddr)
          .send(this.options)
          .on('transactionHash', sendTxCallback);

        resolve(response.transaction.id);
      } catch (e) {
        reject(e);
      }
    });
  };

  getMappingFor = async erc20TokenAddr => {
    const res = await this.hmyManagerContract.methods.mappings(erc20TokenAddr).call(this.options);

    return res;
  };

  checkHmyBalance = async (hrc20Address, addr: string) => {
    const tokenJson = require('../out/MyERC20.json');
    const hmyTokenContract = this.hmy.contracts.createContract(tokenJson.abi, hrc20Address);

    const addrHex = this.hmy.crypto.getAddress(addr).checksum;

    return await hmyTokenContract.methods.balanceOf(addrHex).call(this.options);
  };

  totalSupply = async hrc20Address => {
    const tokenJson = require('../out/MyERC20.json');
    const hmyTokenContract = this.hmy.contracts.createContract(tokenJson.abi, hrc20Address);

    return await hmyTokenContract.methods.totalSupply().call(this.options);
  };
}
