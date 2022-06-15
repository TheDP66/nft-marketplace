const hre = require("hardhat");

//// SYNTAX FOR RUN THE TEST
// npx hardhat node

// DEPLOY CONTRACT
// npx hardhat run scripts/deploy.js --network localhost
// npx hardhat run scripts/deploy.js --network ropsten

async function main() {
  // const NFTMarket = await hre.ethers.getContractFactory("NFTMarket");
  // const nftMarket = await NFTMarket.deploy();

  // await nftMarket.deployed();

  // console.log("nftMarket deployed to:", nftMarket.address);

  // const NFT = await hre.ethers.getContractFactory("NFT");
  // const nft = await NFT.deploy(nftMarket.address);
  // await nft.deployed();

  // console.log("nft deployed to:", nft.address);

  const Transactions = await hre.ethers.getContractFactory("Transactions");
  const transactions = await Transactions.deploy();
  await transactions.deployed();

  console.log("transactions deployed to:", transactions.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
