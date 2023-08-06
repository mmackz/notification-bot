require("dotenv").config();
const Web3 = require("web3");
const questFactoryAbi = require("./abi");

const arbWeb3 = new Web3(
   new Web3.providers.HttpProvider(
      `https://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
   )
);

const polygonWeb3 = new Web3(
   new Web3.providers.HttpProvider(
      `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
   )
);

const optimismWeb3 = new Web3(
   new Web3.providers.HttpProvider(
      `https://opt-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
   )
);

// Address for Quest Factory contract
const contractAddress = "0x52629961f71c1c2564c5aa22372cb1b9fa9eba3e";

module.exports = {
   Optimism: {
      contract: new optimismWeb3.eth.Contract(questFactoryAbi, contractAddress),
      web3: optimismWeb3
   },
   Polygon: {
      contract: new polygonWeb3.eth.Contract(questFactoryAbi, contractAddress),
      web3: polygonWeb3
   },
   Arbitrum: {
      contract: new arbWeb3.eth.Contract(questFactoryAbi, contractAddress),
      web3: arbWeb3
   }
};
