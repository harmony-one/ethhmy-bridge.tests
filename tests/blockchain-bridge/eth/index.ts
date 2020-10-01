import { EthMethods } from './EthMethods';
import { EthMethodsERC20 } from './EthMethodsERC20';
const Web3 = require('web3');
const ethBUSDJson = require('../out/MyERC20.json');
const ethBUSDManagerJson = require('../out/LINKEthManager.json');
const ethLINKJson = require('../out/MyERC20.json');
const ethLINKManagerJson = require('../out/LINKEthManager.json');
const ethManagerJson = require('../out/EthManagerERC20.json');

const web3URL = process.env.ETH_NODE_URL;

export interface IWeb3Client {
  web3: typeof Web3;
  getEthBalance: (addr: string) => Promise<string>;
  ethMethodsBUSD: EthMethods;
  ethMethodsLINK: EthMethods;
  ethMethodsERC20: EthMethodsERC20;
  userAddress: string;
}

export const getWeb3Client = (ethPK = ''): IWeb3Client => {
  const web3 = new Web3(web3URL);

  const ethUserAccount = ethPK
    ? web3.eth.accounts.privateKeyToAccount(ethPK)
    : web3.eth.accounts.create();

  web3.eth.accounts.wallet.add(ethUserAccount);
  web3.eth.defaultAccount = ethUserAccount.address;

  const ethBUSDContract = new web3.eth.Contract(ethBUSDJson.abi, process.env.ETH_BUSD_CONTRACT);

  const ethBUSDManagerContract = new web3.eth.Contract(
    ethBUSDManagerJson.abi,
    process.env.ETH_BUSD_MANAGER_CONTRACT
  );

  const ethLINKContract = new web3.eth.Contract(ethLINKJson.abi, process.env.ETH_LINK_CONTRACT);

  const ethLINKManagerContract = new web3.eth.Contract(
    ethLINKManagerJson.abi,
    process.env.ETH_LINK_MANAGER_CONTRACT
  );

  const ethMethodsBUSD = new EthMethods({
    web3: web3,
    ethTokenContract: ethBUSDContract,
    ethManagerContract: ethBUSDManagerContract,
    ethManagerAddress: process.env.ETH_BUSD_MANAGER_CONTRACT,
    userAddress: ethUserAccount.address,
  });

  const ethMethodsLINK = new EthMethods({
    web3: web3,
    ethTokenContract: ethLINKContract,
    ethManagerContract: ethLINKManagerContract,
    ethManagerAddress: process.env.ETH_LINK_MANAGER_CONTRACT,
    userAddress: ethUserAccount.address,
  });

  const ethManagerContract = new web3.eth.Contract(
    ethManagerJson.abi,
    process.env.ETH_ERC20_MANAGER_CONTRACT
  );

  const ethMethodsERC20 = new EthMethodsERC20({
    web3: web3,
    ethManagerContract: ethManagerContract,
    ethManagerAddress: process.env.ETH_ERC20_MANAGER_CONTRACT,
    userAddress: ethUserAccount.address,
  });

  const getEthBalance = (ethAddress): Promise<string> => {
    return new Promise((resolve, reject) => {
      web3.eth.getBalance(ethAddress, (err, balance) => {
        if (err) {
          reject(err);
        }
        // const rez = String(new BN(balance).div(new BN(1e18)));

        resolve(String(Number(balance) / 1e18));
      });
    });
  };

  return {
    web3,
    getEthBalance,
    ethMethodsBUSD,
    ethMethodsLINK,
    ethMethodsERC20,
    userAddress: ethUserAccount.address,
  };
};
