import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";

import { nftmarketaddress, nftaddress } from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import Image from "next/image";

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([]);
  const [sold, setSold] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    // RPC Moralis
    // const provider = new ethers.providers.JsonRpcProvider(
    //   "https://speedy-nodes-nyc.moralis.io/11639b08a2116a37c0d1e37c/eth/ropsten"
    // );
    // RPC Metamask (local)
    // const provider = new ethers.providers.JsonRpcProvider(
    //   "https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
    // );
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const data = await marketContract.fetchItemsCreated();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);

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
          sold: i.sold,
          type: type[0],
        };
        return item;
      })
    );

    const soldItems = items.filter((i) => i.sold);
    setSold(soldItems);

    console.log(items);

    setNfts(items);
    setLoadingState("loaded");
  }

  return (
    <div>
      <div className="p-4">
        <h2 className="text-2xl py-2">Items Created</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
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
                    alt={nft.name}
                    src={nft.image}
                    className="rounded mt-4"
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
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">
                    Price - {nft.price} Eth
                  </p>
                </div>
              </div>
            ) : (
              <></>
            )
          )}
        </div>
      </div>
      <div className="px-4">
        {Boolean(sold.length) && (
          <div>
            <h2 className="text-2xl py-2">Items Sold</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {sold.map((nft, i) => (
                <div
                  key={i}
                  className="border shadow rounded-xl overflow-hidden"
                  style={{ width: 250 }}
                >
                  <Image
                    layout="responsive"
                    objectFit="contain"
                    width={"100%"}
                    height={"100%"}
                    alt={nft.name}
                    src={nft.image}
                  />
                  <div className="p-4 bg-black">
                    <p className="text-2xl font-bold text-white">
                      Price - {nft.price} Eth
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
