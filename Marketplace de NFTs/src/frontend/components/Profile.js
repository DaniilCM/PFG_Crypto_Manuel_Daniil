import { useState, useEffect } from "react";
import { Button, Card, Col, Form, Row, Tabs, Tab } from "react-bootstrap";
import { ethers } from "ethers";

function renderListedItems(items, marketplace) {
  const cancelOffer = async (item) => {
    try{
    await (await marketplace.cancelItemOffer(item.itemId)).wait();
    } catch (error) {
      console.log("Offer cancelation failed.");
    }
    window.location.href = window.location.origin + '/profile';
  };

  return (
    <>
      <h2>Listed</h2>
      <Row xs={1} md={2} lg={4} className="g-4 py-3">
        {items.map((item, idx) => (
          <Col key={idx} className="overflow-hidden">
            <Card className="custom-card">
              <Card.Img variant="top" src={item.image} className="card-img-top" />
              <Card.Body color="secondary">
                <Card.Title>{item.name}</Card.Title>
              </Card.Body>
              <Card.Footer>
                <div className="d-grid">
                  {ethers.utils.formatEther(item.totalPrice)} ETH
                  <Button onClick={() => cancelOffer(item)} variant="primary" size="md" style={{ marginTop: '10px', backgroundColor: '#333333' }}>
                    Cancel Offer
                  </Button>
                </div>
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
            <Card className="custom-card">
              <Card.Img variant="top" src={item.image} className="card-img-top" />
              <Card.Body color="secondary">
                <Card.Title>{item.name}</Card.Title>
              </Card.Body>
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

function renderPurchasedItems(purchases) {
  return (
    <>
      <h2>My Purchases</h2>
      {purchases.length > 0 ? (
        <Row xs={1} md={2} lg={4} className="g-4 py-3">
          {purchases.map((item, idx) => (
            <Col key={idx} className="overflow-hidden">
              <Card className="custom-card">
                <Card.Img variant="top" src={item.image} className="card-img-top" />
                <Card.Body color="secondary">
                  <Card.Title>{item.name}</Card.Title>
                </Card.Body>
                <Card.Footer>{ethers.utils.formatEther(item.totalPrice)} ETH</Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <main style={{ padding: "1rem 0" }}>
          <h2>No purchases</h2>
        </main>
      )}
    </>
  );
}

function renderOwnedItems(items, marketplace, nft) {
  let price = null;

  const createOffer = async (item, marketplace, price, nft) => {
    console.log(`prepare to send: ${item.nft} ${item.itemId} ${price} ${item}`);

    if (price == null || price <= 0) {
      alert("The selected price cannot be empty or 0.");
    } else {
      try{
      console.log(`prepare to send: ${item.nft} ${item.itemId} ${price} ${item}`);
      await (await marketplace.makeItem(nft.address, item.itemId, ethers.utils.parseEther(price))).wait();
      window.location.href = window.location.origin + '/profile';
      } catch (error) {
        console.log("Offer creation failed.")
      }
    }
  };

  return (
    <>
      <h2>Owned</h2>
      <Row xs={1} md={2} lg={4} className="g-4 py-3">
        {items.map((item, idx) => (
          <Col key={idx} className="overflow-hidden">
            <Card className="custom-card">
              <Card.Img variant="top" src={item.image} className="card-img-top" />
              <Card.Body color="secondary">
                <Card.Title>{item.name}</Card.Title>
              </Card.Body>
              <Card.Footer>
                <Form.Control id="price" onChange={(e) => price = e.target.value} size="md" required type="number" placeholder="Price (ETH)" />
                <Button onClick={() => createOffer(item, marketplace, price, nft)} variant="primary" size="md" style={{ marginTop: '10px', backgroundColor: '#333333' }}>
                  Offer
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}


// Exporting the component as default
export default function Profile({ marketplace, nft, account }) {

  // State variables initialization
  const [loading, setLoading] = useState(true);
  const [listedItems, setListedItems] = useState([]);
  const [soldItems, setSoldItems] = useState([]);
  const [ownedItems, setOwnedItems] = useState([]);
  const [purchases, setPurchases] = useState([]);

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

  const loadPurchasedItems = async () => {
    const filter = marketplace.filters.Bought(null, null, null, null, null, account);
    const results = await marketplace.queryFilter(filter);
    const purchases = await Promise.all(results.map(async i => {
      i = i.args;
      const uri = await nft.tokenURI(i.tokenId);
      const response = await fetch(uri);
      const metadata = await response.json();
      const totalPrice = await marketplace.getTotalPrice(i.itemId);
      let purchasedItem = {
        totalPrice,
        price: i.price,
        itemId: i.itemId,
        name: metadata.name,
        description: metadata.description,
        image: metadata.image
      };
      return purchasedItem;
    }))
    setLoading(false);
    setPurchases(purchases);
  }

  // Effect hook to load the items
  useEffect(() => {
    loadListedItems()
  }, [])

  useEffect(() => {
    loadPurchasedItems()
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

  if (loading) return (
    <main style={{ padding: "1rem 0" }} >
      <h2> Loading... </h2> </main>
  );


  // If there are assets, render them
  return (
    <div className='flex justify-center'>
      <div className='px-5 py-3 container'>
        <Tabs defaultActiveKey='owned' className='custom-tabs'>
          <Tab eventKey='owned' title='Owned'>
            <div className='custom-tab-content'>
              {renderOwnedItems(ownedItems, marketplace, nft)}
            </div>
          </Tab>
          <Tab eventKey='listed' title='Listed'>
            <div className='custom-tab-content'>
              {renderListedItems(listedItems, marketplace)}
            </div>
          </Tab>
          <Tab eventKey='sold' title='Sold'>
            <div className='custom-tab-content' >
              {renderSoldItems(soldItems)}
            </div>
          </Tab>
          <Tab eventKey='purchases' title='Purchases'>
            <div className='custom-tab-content' >
              {renderPurchasedItems(purchases)}
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}