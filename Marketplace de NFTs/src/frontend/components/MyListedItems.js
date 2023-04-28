import { useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { ethers } from "ethers";

function renderListedItems(items, marketplace) {
  const cancelOffer = async (item) => {
    await (await marketplace.cancelItemOffer(item.itemId)).wait();
  };

  return (
    <>
      <h2>Listed</h2>
      <Row xs={1} md={2} lg={4} className="g-4 py-3">
        {items.map((item, idx) => (
          <Col key={idx} className="overflow-hidden">
            <Card>
              <Card.Img variant="top" src={item.image} />
              <Card.Footer>
                {ethers.utils.formatEther(item.totalPrice)} ETH
                <Button onClick={() => cancelOffer(item)} variant="primary" size="md">
                  Cancel Offer
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}

function renderSoldItems(items) {
  return (
    <>
      <h2>Sold</h2>
      <Row xs={1} md={2} lg={4} className="g-4 py-3">
        {items.map((item, idx) => (
          <Col key={idx} className="overflow-hidden">
            <Card>
              <Card.Img variant="top" src={item.image} />
              <Card.Footer>
                For {ethers.utils.formatEther(item.totalPrice)} ETH - Received {ethers.utils.formatEther(item.price)} ETH
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}

function renderOwnedItems(items, marketplace, nft) {
  const [price, setPrice] = useState(null);

  const createOffer = async (item, marketplace, price, nft) => {
    console.log(`prepare to send: ${item.nft} ${item.itemId} ${price} ${item}`);

    if (price == null || price <= 0) {
      alert("The selected price cannot be empty or 0.");
    } else {
      console.log(`prepare to send: ${item.nft} ${item.itemId} ${price} ${item}`);
      await (await marketplace.makeItem(nft.address, item.itemId, ethers.utils.parseEther(price))).wait();
    }
  };

  return (
    <>
      <h2>Owned</h2>
      <Row xs={1} md={2} lg={4} className="g-4 py-3">
        {items.map((item, idx) => (
          <Col key={idx} className="overflow-hidden">
            <Card>
              <Card.Header>{item.name}</Card.Header>
              <Card.Img variant="top" src={item.image} />
              <Card.Footer>
                {console.log(`prepare to send: ${item.nft} ${item.itemId} ${price} ${item}`)}
                <Button onClick={() => createOffer(item, marketplace, price, nft)} variant="primary" size="md">
                  Offer
                </Button>
                <Form.Control id="price" onChange={(e) => setPrice(e.target.value)} size="md" required type="number" placeholder="Price (ETH)" />
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}

import React, { useState, useEffect } from 'react';

// Exporting the component as default
export default function MyListedItems({ marketplace, nft, account }) {

  // State variables initialization
  const [loading, setLoading] = useState(true);
  const [listedItems, setListedItems] = useState([]);
  const [soldItems, setSoldItems] = useState([]);
  const [ownedItems, setOwnedItems] = useState([]);

  // Function to load listed, sold and owned items
  const loadListedItems = async () => {

    // Getting the count of items and NFTs
    const itemCount = await marketplace.itemCount();
    const nftCount = await nft.tokenCount();

    // Initializing temporary arrays to store the items
    let listedItems = [];
    let soldItems = [];
    let ownedItems = [];

    // Looping through the items
    for (let indx = 1; indx <= itemCount; indx++) {
      const i = await marketplace.items(indx);
      if (i.seller.toLowerCase() === account) {
        const uri = await nft.tokenURI(i.tokenId);
        const response = await fetch(uri);
        const metadata = await response.json();
        const totalPrice = await marketplace.getTotalPrice(i.itemId);
        let item = {
          totalPrice,
          price: i.price,
          itemId: i.itemId,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image
        };
        if (!i.canceled && !i.sold) listedItems.push(item);
        if (i.sold) soldItems.push(item);
      }
    }

    // Looping through the NFTs
    for (let indx = 1; indx <= nftCount.toNumber(); indx++) {
      const i = await nft.ownerOf(indx);
      if (i.toLowerCase() === account) {
        const uri = await nft.tokenURI(indx);
        const response = await fetch(uri);
        const metadata = await response.json();
        let item = {
          totalPrice: 0,
          price: 0,
          itemId: indx,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image
        };
        ownedItems.push(item);
      }
    }

    // Updating the state variables
    setLoading(false);
    setListedItems(listedItems);
    setSoldItems(soldItems);
    setOwnedItems(ownedItems)
  }

  // Effect hook to load the items
  useEffect(() => {
    loadListedItems()
  }, [])

  // If loading is true, show a loading message
  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  );

  // If there are no assets, show a message
  if (listedItems.length === 0 && soldItems.length === 0 && ownedItems.length === 0) {
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>No assets</h2>
      </main>
    )
  }

  // If there are assets, render them
  return (
    <div className='flex justify-center'>
      <div className='px-5 py-3 container'>
        {listedItems.length > 0 && renderListedItems(listedItems, marketplace)}
        {soldItems.length > 0 && renderSoldItems(soldItems)}
        {ownedItems.length > 0 && renderOwnedItems(ownedItems, marketplace, nft)}
      </div>
    </div>
  );
}