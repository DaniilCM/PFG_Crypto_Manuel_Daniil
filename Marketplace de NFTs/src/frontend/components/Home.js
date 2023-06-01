/* eslint-disable react/react-in-jsx-scope */
import { useState, useEffect } from 'react';
import { ethers } from "ethers";
import { Row, Col, Card, Button } from 'react-bootstrap';
import Select from 'react-select';

const Home = ({ marketplace, nft }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const ongs = [
    { value: 'CruzRoja', label: 'Cruz Roja' },
    { value: 'MedicosSinFronteras', label: 'Medicos Sin Fronteras' }
  ];
  const handleChange = (selected) => {
    setSelectedOption(selected);
  };
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const loadMarketplaceItem = async () => {
    const itemCount = await marketplace.itemCount();
    let items = []
    for (let i = 1; i <= itemCount; i++) {
      const item = await marketplace.items(i);
      if (!item.sold) {
        const uri = await nft.tokenURI(item.tokenId);
        const response = await fetch(uri);
        const metadata = await response.json()
        const totalPrice = await marketplace.getTotalPrice(item.itemId);
        if (!item.sold && !item.canceled)
          items.push({
            totalPrice,
            itemId: item.itemId,
            seller: item.seller,
            name: metadata.name,
            description: metadata.description,
            image: metadata.image
          });
      }
    }
    setLoading(false);
    setItems(items);
  }

  const buyMarketItem = async (item, ong) => {
    await (await marketplace.purchaseItem(item.itemId, ong, { value: item.totalPrice })).wait();
    loadMarketplaceItem();
  }

  useEffect(() => {
    loadMarketplaceItem()
  }, [])

  if (loading) return (
    <main style={{ padding: "1rem 0" }} >
      <h2 > Loading... </h2>
    </main >
  )

  return (
    <div className="flex justify-center">
      {items.length > 0 ? (
        <div className="px-5 py-3 container">
          <h1>Last Listed!</h1>
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {items.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body color="secondary">
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>{item.description}</Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <div className="d-grid">
                      <Select
                        value={selectedOption}
                        onChange={handleChange}
                        options={ongs}
                      />
                      <Button onClick={() => buyMarketItem(item, selectedOption.value)} variant="primary" size="lg">
                        Buy by {ethers.utils.formatEther(item.totalPrice)} ETH
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <main style={{ padding: "1rem 0" }}>
          <h2>No assets</h2>
        </main>
      )}
    </div>
  );
}

export default Home