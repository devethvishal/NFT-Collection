require("@nomiclabs/hardhat-waffle");
require ("dotenv").config({path:'.env'});

const ROPSTEN_API_URL = process.env.ROPSTEN_API_URL;
const METAMASK_PRIVATE_KEY = process.env.METAMASK_PRIVATE_KEY;

module.exports = {
  solidity: "0.8.4",
  networks:{
    "ropsten": {
      url: ROPSTEN_API_URL,
      accounts: [METAMASK_PRIVATE_KEY]
    }
  }
};
