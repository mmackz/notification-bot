const NodeCache = require("node-cache");

const myCache = new NodeCache({ stdTTL: 300 }); // 300 seconds = 5 minutes

function getCache(key) {
   return myCache.get(key);
}

function setCache(key, data) {
   myCache.set(key, data);
}

module.exports = {
   getCache,
   setCache
};
