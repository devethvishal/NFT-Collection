const {ethers} = require("hardhat");
const { METADATA_URL, WHITELIST_CONTRACT_ADDRESS } = require("../constants");

async function main() {
  const CryptoDevsContract = await ethers.getContractFactory("CryptoDevs");
  const deployedCryptoDevsContract = await CryptoDevsContract.deploy(
    METADATA_URL,
    WHITELIST_CONTRACT_ADDRESS
  );
  await deployedCryptoDevsContract.deployed();
  console.log("CryptoDev Contract deployed successfully at the address : "+deployedCryptoDevsContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
