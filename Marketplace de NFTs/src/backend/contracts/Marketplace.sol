// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {

    address payable public immutable feeAccount;
    address payable public ONGAddress;
    uint public feePercent;
    uint public itemCount;

    struct Item {
        uint itemId;
        IERC721 nft;
        uint tokenId;
        uint price;
        address payable seller;
        bool sold;
        bool canceled;
    }

    mapping(uint => Item) public items;

    event Offered(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed ONGAddress
    );
    event Bought(
        uint itemId,
        address indexed nft,
        uint tokenId, 
        uint price,
        address indexed seller,
        address indexed buyer
    );

    event OfferCanceled(
        uint itemId,
        address indexed nft,
        uint tokenId, 
        address indexed seller
    );

    constructor (uint _feePercent, address payable _ONGAddress) {
        feeAccount = payable(msg.sender);
        ONGAddress = _ONGAddress;
        feePercent = _feePercent;
    }

    function makeItem(IERC721 _nft, uint _tokenId, uint _price) external nonReentrant {
        require(_price > 0, "Price must be greater than zero");
        itemCount++;
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        items[itemCount] = Item(
            itemCount,
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            false,
            false
        );
        emit Offered(
            itemCount, 
            address(_nft),
            _tokenId,
            _price,
            msg.sender
        );
    }

    function purchaseItem(uint _itemId) external payable nonReentrant {
        uint _totalPrice = getTotalPrice(_itemId);
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount);
        require(msg.value >= _totalPrice);
        require(!item.sold);
        item.seller.transfer(item.price);
        payTax(_feePercent, _totalPrice);
        feeAccount.transfer(_totalPrice - item.price);
        item.sold = true;
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);
        emit Bought(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.price,
            item.seller,
            msg.sender,
            ONGAddress
        );
    }

    function getTotalPrice(uint _itemId) view public returns(uint) {
        return ((items[_itemId].price*(100 + feePercent))/100);
    }

    function cancelItemOffer(uint _itemId) external payable nonReentrant {
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount);
        require(item.seller == msg.sender);
        require(!item.sold);
        item.canceled = true;
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);
        emit OfferCanceled(
            _itemId,
            address(item.nft),
            item.tokenId,
            msg.sender
        );
    }

    function setONGWalletAddress(address payable _ONGAddress) public {
        require(_ONGAddress != address(0), "Invalid address");
        ONGAddress = _ONGAddress;
    }

    function payTax(uint256 _feePercent, uint _totalPrice) public {
        if (ONGAddress != address(0)) {
            uint256 halfTax = _feePercent.div(2);
            ONGAddress.transfer(halfTax);
            feeAccount.transfer(halfTax.add(_totalPrice));
        } else {
            feeAccount.transfer(_feePercent);
        }
    }
}