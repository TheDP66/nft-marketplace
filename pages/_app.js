import { ethers } from "ethers";
import { useState, useEffect } from "react";
import axios from "axios";
import Web3Modal, { isMobile } from "web3modal";

import { nftaddress, nftmarketaddress } from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

import "../styles/globals.css";
import Link from "next/link";
import { render } from "react-dom";

function MyApp({ Component, pageProps }) {
  async function handleLogin() {
    if (window.ethereum) {
      // console.log(isMobile);

      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);

      const signer = provider.getSigner();

      // const signature = await signer.signMessage("Sign Up Bro?");
      const a = await signer.getAddress();
      const b = await signer.getBalance();
      const bb = ethers.utils.formatUnits(b.toString(), "ether");
      const c = await signer.getChainId();
      const f = await signer.getFeeData();
      const g = await signer.getGasPrice();
      const gg = ethers.utils.formatUnits(g.toString(), "ether");
      const t = await signer.getTransactionCount();

      // console.log("Address: ", a);
      // console.log("Balance: ", bb);
      // console.log("ChainId: ", c);
      // console.log("gasFeeData: ", f);
      // console.log("gasPrice: ", gg);
      // console.log("Transaction Count: ", t);
    } else {
      alert("Install Metamask First!");
    }
  }

  return (
    <div>
      <nav className="border-b p-6">
        <p className="text-4xl font-bold">Metaverse Marketplace</p>
        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-4 text-pink-500">Home</a>
          </Link>
          <Link href="/create-item">
            <a className="mr-6 text-pink-500">Sell Digital Asset</a>
          </Link>
          <Link href="/my-assets">
            <a className="mr-6 text-pink-500">My Digital Assets</a>
          </Link>
          <Link href="/creator-dashboard">
            <a className="mr-6 text-pink-500">Creator Dashboard</a>
          </Link>
          <Link href="/testAuth">
            <a className="mr-6 text-pink-500">MetaMask Auth</a>
          </Link>
        </div>
      </nav>
      <p className="text-center text-xl">
        Change your MetaMask network into <b>Ropsten Test Network</b>
      </p>
      <Component {...pageProps} />;
    </div>
  );
}

export default MyApp;
