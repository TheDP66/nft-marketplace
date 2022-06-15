// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Transactions is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tfIds;

    event Fee(
        uint256 indexed feeId,
        address from,
        address receiver,
        uint256 amount,
        uint256 timestamp
    );

    struct FeeStruct {
        uint256 feeId;
        address from;
        address receiver;
        uint256 amount;
        uint256 timestamp;
    }

    FeeStruct[] transactions;

    function adminFee(address payable receiver, uint256 amount)
        public
        payable
        nonReentrant
    {
        require(amount > 0, "Price must be at least 1 wei");

        _tfIds.increment();
        uint256 transactionCount = _tfIds.current();

        transactions.push(
            FeeStruct(
                transactionCount,
                msg.sender,
                receiver,
                amount,
                block.timestamp
            )
        );

        emit Fee(
            transactionCount,
            msg.sender,
            receiver,
            amount,
            block.timestamp
        );
    }

    function getAllTransactions() public view returns (FeeStruct[] memory) {
        return transactions;
    }

    function getMyTransactions() public view returns (FeeStruct[] memory) {
        uint256 totalTrCount = _tfIds.current();
        uint256 trCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalTrCount; i++) {
            if (transactions[i + 1].from == msg.sender) {
                trCount += 1;
            }
        }

        FeeStruct[] memory items = new FeeStruct[](trCount);
        for (uint256 i = 0; i < totalTrCount; i++) {
            if (transactions[i + 1].from == msg.sender) {
                uint256 currentId = transactions[i + 1].feeId;
                FeeStruct storage currentItem = transactions[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }
}
