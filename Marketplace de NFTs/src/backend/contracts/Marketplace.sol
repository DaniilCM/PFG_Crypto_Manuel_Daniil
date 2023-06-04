// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Marketplace is ReentrancyGuard {
    using SafeMath for uint;
    address payable public immutable feeAccount;
    uint public immutable feePercent;
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
    mapping(string => address payable) public ongs;

    event Offered(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller
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

    constructor(uint _feePercent) {
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
        ongs["CruzRoja"] = payable(0xce6fe87b0F99cAe738c1F40208e6929C6eB00049);
    }

    function makeItem(
        IERC721 _nft,
        uint _tokenId,
        uint _price
    ) external nonReentrant {
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
        emit Offered(itemCount, address(_nft), _tokenId, _price, msg.sender);
    }

    function purchaseItem(
        uint _itemId,
        string memory _ONG
    ) external payable nonReentrant {
        address payable ongAddress = ongs[_ONG];
        uint _totalPrice = getTotalPrice(_itemId);
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount);
        require(msg.value >= _totalPrice);
        require(!item.sold);
        payTax(_totalPrice, item.price, ongAddress);
        item.seller.transfer(item.price);
        item.sold = true;
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);
        emit Bought(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.price,
            item.seller,
            msg.sender
        );
    }

    function getTotalPrice(uint _itemId) public view returns (uint) {
        return ((items[_itemId].price * (100 + feePercent)) / 100);
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

    function payTax(
        uint _totalPrice,
        uint _itemPrice,
        address payable _ONG
    ) public {
        uint tax = _totalPrice - _itemPrice;
        _ONG.transfer(tax.div(2));
        feeAccount.transfer(tax.div(2));
    }

    function setONGWalletAddress(
        address payable _ONGAddress,
        string memory _ONGname
    ) external {
        ongs[_ONGname] = _ONGAddress;
    }
}
