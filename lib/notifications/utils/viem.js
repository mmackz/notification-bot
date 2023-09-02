const { createPublicClient, http } = require("viem");
const chains = require("viem/chains");
require("dotenv").config();

const transport = http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`);

module.exports = createPublicClient({
   chain: chains.mainnet,
   transport
});
