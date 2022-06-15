import { BigNumber, ethers } from "ethers";
import { useState, useEffect } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import Image from "next/image";

import styles from "../styles/Home.module.css";
import { nftaddress, nftmarketaddress } from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    console.log("loading");

    // RPC Moralis
    const provider = new ethers.providers.JsonRpcProvider(
      "https://speedy-nodes-nyc.moralis.io/11639b08a2116a37c0d1e37c/eth/ropsten"
    );
    // Local
    // const provider = new ethers.providers.JsonRpcProvider();
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      provider
    );
    console.log("get contract");

    const data = await marketContract.fetchMarketItems();
    console.log("get data");

    console.log(data);

    const items = await Promise.all(
      data.map(async (i) => {
        // console.log("i: ", i);
        console.log("itemId: ", i.itemId);
        // console.log("tokenId: ", i.tokenId);

        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        // console.log("tokenUri: ", tokenUri);

        const meta = await axios.get(tokenUri);
        // console.log("meta: ", meta);

        var req = await fetch(meta.data.image, { method: "HEAD" });
        var mime = req.headers.get("content-type");

        let type = mime.split("/", 1);

        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
          type: type[0],
        };

        return item;
      })
    );

    console.log(items);
    setNfts(items);

    setLoadingState("loaded");
  }

  async function buyNft(nft) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

    const transaction = await contract.createMarketSale(
      nftaddress,
      nft.tokenId,
      {
        value: price,
      }
    );
    await transaction.wait();

    loadNFTs();
  }

  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>;

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: "1600px" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {/* {console.log(nfts)} */}
          {nfts.map((nft, i) =>
            nft.type == "image" || nft.type == "audio" ? (
              <div
                key={i}
                className="border shadow rounded-xl overflow-hidden"
                style={{ width: 250 }}
              >
                {nft.type == "image" ? (
                  <Image
                    layout="responsive"
                    objectFit="contain"
                    width={"100%"}
                    height={"100%"}
                    className="rounded mt-4"
                    alt={nft.name}
                    src={nft.image}
                  />
                ) : nft.type == "audio" ? (
                  <div className="h-[248px] w-full my-auto bg-gray-300 text-center justify-center align-middle items-center flex">
                    <audio controls className="w-full">
                      <source src={nft.image} type="audio/mpeg" />
                    </audio>
                  </div>
                ) : (
                  <></>
                )}
                <div className="p-4">
                  <p
                    style={{ height: "64px" }}
                    className="text-2xl font-semiBold"
                  >
                    {nft.name}
                  </p>
                  <div className="h-[70] overflow-hidden">
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl mb-4 font-bold text-white">
                    {nft.price} Eth
                  </p>
                  <button
                    className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
                    onClick={() => buyNft(nft)}
                  >
                    Buy
                  </button>
                </div>
              </div>
            ) : (
              <></>
            )
          )}
        </div>
      </div>
    </div>
  );
}
