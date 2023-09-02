const { request } = require("graphql-request");
const Arweave = require("arweave");
const logger = require("../../utils/logging");

const arweave = Arweave.init({ host: "arweave.net", protocol: "https", timeout: 3000000 });
const endpoint = "https://arweave.net/graphql";

// Rabbithole Mirror Addresses
const MIRROR_ADDRESSES = [
   "0xAfdFB268C7984925e3990c768B474578adEca20E",
   "0xa4C8bB4658Bc44Bac430699c8b7b13DaB28E0F4e",
   "0x565B93a15d38aCD79c120b15432D21E21eD274d6",
   "0xF719d5d368dA5c7006bFBb7e0A4873b5115Aa11f"
];

// Funding Recipient - pathfinders.eth
const FUNDING_RECIPIENT = "0xF719d5d368dA5c7006bFBb7e0A4873b5115Aa11f";

async function getCurrentBlockHeight() {
   const arweaveGetCurrentBlock = async () => {
      try {
         const block = await arweave.blocks.getCurrent();
         return block.height;
      } catch (error) {
         throw new Error("Error getting block height from arweave.getCurrentBlock");
      }
   };

   const fetchArweaveInfo = async () => {
      try {
         const response = await fetch("https://arweave.net/info");
         const data = await response.json();
         return data.height;
      } catch (error) {
         throw new Error("Error getting block height from https://arweave.net/info");
      }
   };

   try {
      const blockHeight = await Promise.race([
         arweaveGetCurrentBlock(),
         fetchArweaveInfo()
      ]);
      return blockHeight;
   } catch (error) {
      logger.error("Both methods failed to get the block height");
      throw error;
   }
}

async function subscribeMirrorPosts(notifyMirrorPost) {
   try {
      let lastBlock = await getCurrentBlockHeight();

      setInterval(async () => {
         const min = lastBlock;
         try {
            const max = await getCurrentBlockHeight();
            if (min < max) {
               const query = getQuery(MIRROR_ADDRESSES, min, max);
               const data = await fetchMirrorData(query);
               if (data.length > 0) {
                  for (const post of data) {
                     await notifyMirrorPost({ digest: post.digest, title: post.title });
                  }
               }
               lastBlock = max + 1;
            }
         } catch (error) {
            logger.info("There was an error fetching mirror data", error);
         }
      }, 600_000);
   } catch (error) {
      logger.info(error);
   }
}

function getQuery(addresses, min, max) {
   const query = `
   query {
      transactions(
         tags: [
            { name: "App-Name", values: "MirrorXYZ" }
            { name: "Contributor", values: ${JSON.stringify(addresses)} }
         ]
         sort: HEIGHT_DESC
         block: { min: ${min} max: ${max} }
      ) {
         edges {
            node {
               id
            }
         }
      }
   }
`;
   return query;
}

async function fetchMirrorData(query) {
   try {
      const data = await request(endpoint, query);
      const posts = data.transactions.edges;
      const postData = [];

      for (const { node: post } of posts) {
         const transaction = await arweave.transactions.get(post.id);

         // get content digest to create link to post
         const tag = transaction.tags.find((tag) => {
            const tagname = tag.get("name", { decode: true, string: true });
            if (tagname === "Original-Content-Digest") {
               return true;
            }
            return false;
         });
         const digest = tag ? tag.get("value", { decode: true, string: true }) : null;
         const data = await arweave.transactions.getData(post.id, {
            decode: true,
            string: true
         });

         const dataObj = JSON.parse(data);

         const author = dataObj.authorship.contributor;
         const recipient = dataObj.wnft?.fundingRecipient;

         if (author === FUNDING_RECIPIENT || recipient === FUNDING_RECIPIENT) {
            if (digest && !postData.some((data) => data.digest === digest)) {
               postData.push({ digest, title: dataObj.content.title });
            }
         }
      }
      return postData;
   } catch (error) {
      logger.error("Error fetching mirror data:", error);
   }
}

module.exports = subscribeMirrorPosts;
