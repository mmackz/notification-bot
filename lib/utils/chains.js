require("dotenv").config();
const Web3 = require("web3");
const contractAbi = require("./abi");

const ethWeb3 = new Web3(
   new Web3.providers.HttpProvider(
      `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
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
      contract: new optimismWeb3.eth.Contract(contractAbi, contractAddress),
      web3: optimismWeb3
   },
   Polygon: {
      contract: new polygonWeb3.eth.Contract(contractAbi, contractAddress),
      web3: polygonWeb3
   },
   Ethereum: {
      contract: new ethWeb3.eth.Contract(contractAbi, contractAddress),
      web3: ethWeb3
   }
};
