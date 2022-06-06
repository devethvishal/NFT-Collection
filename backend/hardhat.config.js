require("@nomiclabs/hardhat-waffle");
require ("dotenv").config({path:'.env'});

const ALCHEMY_API_URL = process.env.ALCHEMY_API_URL;
const METAMASK_PRIVATE_KEY = process.env.METAMASK_PRIVATE_KEY;

module.exports = {
  solidity: "0.8.4",
  networks:{
    "rinkeby": {
      url: ALCHEMY_API_URL,
      timeout:100000,
      accounts: [METAMASK_PRIVATE_KEY]
    }
  }
};
