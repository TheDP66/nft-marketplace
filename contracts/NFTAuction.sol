// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
// security mechanism that give us a utility call non reentrant
// allow us to protect transaction from another contract to hitting us with multiple request transaction
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "hardhat/console.sol";

contract NFTAuction {
    event Start();
    event End(address hightestBidder, uint256 highestBid);
    event Bid(address indexed sender, uint256 amount);
    event Withdraw(address indexed bidder, uint256 amount);

    address payable public seller;

    bool public started;
    bool public ended;
    uint256 public endAt;

    address public nft;
    uint256 public nftId;

    uint256 public highestBid;
    address public highestBidder;
    mapping(address => uint256) public bids;

    constructor() {
        seller = payable(msg.sender);
    }

    function start(
        address _nft,
        uint256 _nftId,
        uint256 startingBid
    ) external {
        require(!started, "Already started!");
        require(msg.sender == seller, "You did not start the action!");

        console.log("Seller :", seller);
        console.log("msg.sender :", msg.sender);
        console.log("address(this) :", address(this));
        console.log("nft :", nft);

        highestBid = startingBid;

        nft = _nft;
        nftId = _nftId;
        IERC721(nft).transferFrom(msg.sender, address(this), nftId);

        started = true;
        endAt = block.timestamp + 3 minutes;

        emit Start();
    }

    function bid() external payable {
        require(started, "Not started.");
        require(block.timestamp < endAt, "Ended!");
        require(msg.value > highestBid);

        if (highestBidder != address(0)) {
            bids[highestBidder] += highestBid;
        }

        highestBid = msg.value;
        highestBidder = msg.sender;

        emit Bid(highestBidder, highestBid);
    }

    function wihtdraw() external payable {
        require(started, "You need to start first!");
        require(block.timestamp >= endAt, "Auction is still ongoing!");

        uint256 bal = bids[msg.sender];
        bids[msg.sender] = 0;
        (bool sent, bytes memory data) = payable(msg.sender).call{value: bal}(
            ""
        );
        require(sent, "Could not withdraw");

        emit Withdraw(msg.sender, bal);
    }

    function end() external {
        require(started, "You need to start first!");
        require(block.timestamp >= endAt, "Auction is still ongoing!");
        require(!ended, "Auction already ended!");

        if (highestBidder != address(0)) {
            console.log("Theres bidder :", highestBidder);

            IERC721(nft).transferFrom(address(this), highestBidder, nftId);
            (bool sent, bytes memory data) = seller.call{value: highestBid}("");
            require(sent, "Could not pay seller!");
        } else {
            console.log("Theres no bidder :", highestBidder);

            IERC721(nft).transferFrom(address(this), seller, nftId);
        }

        ended = true;
        emit End(highestBidder, highestBid);
    }
}
