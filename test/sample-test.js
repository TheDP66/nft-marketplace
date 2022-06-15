const { expect } = require("chai");
const { ethers } = require("hardhat");

//// SYNTAX FOR RUN THE TEST
// npx hardhat test

describe("NFTMarket", function () {
  it("Should create and execute market sales", async function () {
    const Market = await ethers.getContractFactory("NFTMarket");
    const market = await Market.deploy();
    await market.deployed();
    const marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed();
    const nftContractAddress = nft.address;

    // const Transaction = await ethers.getContractFactory("Transactions");
    // const transaction = await Transaction.deploy();
    // await transaction.deployed();
    // const transactionAddress = transaction.address;
    // console.log("trAddress: ", transactionAddress);

    // const [_, buyerAddress] = await ethers.getSigners();
    // const auctionPrice = ethers.utils.parseUnits("100", "ether");

    // await transaction.connect(buyerAddress).adminFee(transactionAddress, auctionPrice);

    // let trs = await transaction.getAllTransactions();

    // trs = await Promise.all(
    //   trs.map(async (i) => {
    //     let tr = {
    //       feeId: i.feeId.toString(),
    //       from: i.from,
    //       receiver: i.receiver,
    //       amount: i.amoung.toString(),
    //       timestamp: i.timestamp,
    //     };
    //     return tr;
    //   })
    // );

    // console.log("trs: ", trs);

    let listingPrice = await market.getListingPrice();
    listingPrice = listingPrice.toString();

    await nft.createToken("https://www.mytokenlocation.com");
    await nft.createToken("https://www.mytokenlocation2.com");

    console.log(nftContractAddress);

    await market.createMarketItem(nftContractAddress, 1, auctionPrice, {
      value: listingPrice,
    });
    await market.createMarketItem(nftContractAddress, 2, auctionPrice, {
      value: listingPrice,
    });

    await market
      .connect(buyerAddress)
      .createMarketSale(nftContractAddress, 1, { value: auctionPrice });

    let items = await market.fetchMarketItems();

    items = await Promise.all(
      items.map(async (i) => {
        const tokenUri = await nft.tokenURI(i.tokenId);
        let item = {
          price: i.price.toString(),
          tokenId: i.tokenId.toString(),
          seller: i.seller,
          owner: i.owner,
          tokenUri,
        };
        return item;
      })
    );

    console.log("items: ", items);
  });
});
