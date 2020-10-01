import { HmyMethods } from './HmyMethods';
import { HmyMethodsERC20 } from './HmyMethodsERC20';
const { Harmony } = require('@harmony-js/core');
const { ChainID, ChainType } = require('@harmony-js/utils');

const hmyBUSDJson = require('../out/MyERC20.json');
const hmyBUSDManagerJson = require('../out/LINKHmyManager.json');
const hmyLINKJson = require('../out/MyERC20.json');
const hmyLINKManagerJson = require('../out/LINKHmyManager.json');
const hmyManagerJson = require('../out/HmyManagerERC20.json');

export interface IHmyClient {
  hmy: typeof Harmony;
  hmyMethodsBUSD: HmyMethods;
  hmyMethodsLINK: HmyMethods;
  hmyMethodsERC20: HmyMethodsERC20;
  userAddress: string;
  getHmyBalance: (addr: string) => Promise<string>;
  getBech32Address: (addr: string) => string;
}

export const getHmyClient = (hmyPK: string): IHmyClient => {
  const hmy = new Harmony(
    // let's assume we deploy smart contract to this end-point URL
    process.env.HMY_NODE_URL,
    {
      chainType: ChainType.Harmony,
      chainId: ChainID.HmyTestnet,
    }
  );

  const hmyUserAccount = hmy.wallet.addByPrivateKey(hmyPK);

  const hmyBUSDContract = hmy.contracts.createContract(
    hmyBUSDJson.abi,
    process.env.HMY_BUSD_CONTRACT
  );

  const hmyBUSDManagerContract = hmy.contracts.createContract(
    hmyBUSDManagerJson.abi,
    process.env.HMY_BUSD_MANAGER_CONTRACT
  );

  const hmyLINKContract = hmy.contracts.createContract(
    hmyLINKJson.abi,
    process.env.HMY_LINK_CONTRACT
  );

  const hmyLINKManagerContract = hmy.contracts.createContract(
    hmyLINKManagerJson.abi,
    process.env.HMY_LINK_MANAGER_CONTRACT
  );

  const hmyManagerContract = hmy.contracts.createContract(
    hmyManagerJson.abi,
    process.env.HMY_ERC20_MANAGER_CONTRACT
  );

  const hmyMethodsBUSD = new HmyMethods({
    hmy: hmy,
    hmyTokenContract: hmyBUSDContract,
    hmyManagerContract: hmyBUSDManagerContract,
    userAddress: hmyUserAccount.address,
  });

  const hmyMethodsLINK = new HmyMethods({
    hmy: hmy,
    hmyTokenContract: hmyLINKContract,
    hmyManagerContract: hmyLINKManagerContract,
    userAddress: hmyUserAccount.address,
  });

  const hmyMethodsERC20 = new HmyMethodsERC20({
    hmy: hmy,
    hmyManagerContract: hmyManagerContract,
    userAddress: hmyUserAccount.address,
  });

  return {
    hmy,
    hmyMethodsBUSD,
    hmyMethodsLINK,
    hmyMethodsERC20,
    userAddress: hmyUserAccount.address,
    getBech32Address: address => hmy.crypto.getAddress(address).bech32,
    getHmyBalance: address => hmy.blockchain.getBalance({ address }),
  };
};
