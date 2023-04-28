import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

function renderListedItems(items, marketplace) {
    const cancelOffer = async(item) => {
        await (await marketplace.cancelItemOffer(item.itemId)).wait();
    }
    return ( <
        >
        <
        h2 > Listed < /h2> <
        Row xs = { 1 }
        md = { 2 }
        lg = { 4 }
        className = "g-4 py-3" > {
            items.map((item, idx) => ( <
                Col key = { idx }
                className = "overflow-hidden" >
                <
                Card >
                <
                Card.Img variant = "top"
                src = { item.image }
                /> <
                Card.Footer > { ethers.utils.formatEther(item.totalPrice) }
                ETH <
                /Card.Footer> <
                Button onClick = {
                    () => cancelOffer(item) }
                variant = "primary"
                size = "md" >
                Cancel Offer <
                /Button> <
                /Card> <
                /Col>
            ))
        } <
        /Row>              <
        />
    )
}

function renderSoldItems(items) {
    return ( <
        >
        <
        h2 > Sold < /h2> <
        Row xs = { 1 }
        md = { 2 }
        lg = { 4 }
        className = "g-4 py-3" > {
            items.map((item, idx) => ( <
                Col key = { idx }
                className = "overflow-hidden" >
                <
                Card >
                <
                Card.Img variant = "top"
                src = { item.image }
                /> <
                Card.Footer >
                For { ethers.utils.formatEther(item.totalPrice) }
                ETH - Recieved { ethers.utils.formatEther(item.price) }
                ETH <
                /Card.Footer> <
                /Card> <
                /Col>
            ))
        } <
        /Row> <
        />
    )
}


function renderOwnedItems(items, marketplace, nft) {
    let price = null;
    const createOffer = async(item, marketplace, price, nft) => {
        console.log("preparo envio: " + item.nft + " " + item.itemId + " " + price + item);
        if (price == null || price <= 0) {
            alert('El precio seleccionado no puede estar vacio o ser 0.')
        } else {
            console.log("preparo envio: " + item.nft + " " + item.itemId + " " + price + item);
            await (await marketplace.makeItem(nft.address, item.itemId, ethers.utils.parseEther(price))).wait();
        }
    }
    return ( <
        >
        <
        h2 > Owned < /h2> <
        Row xs = { 1 }
        md = { 2 }
        lg = { 4 }
        className = "g-4 py-3" > {
            items.map((item, idx) => ( <
                Col key = { idx }
                className = "overflow-hidden" >
                <
                Card >
                <
                Card.Header > { item.name } < /Card.Header>  <
                Card.Img variant = "top"
                src = { item.image }
                />              <
                Card.Footer > { console.log("preparo envio: " + item.nft + " " + item.itemId + " " + price + item) } <
                Button onClick = {
                    () => createOffer(item, marketplace, price, nft) }
                variant = "primary"
                size = "md" >
                Offer <
                /Button> <
                Form.Control id = "price"
                onChange = {
                    (e) => price = e.target.value }
                size = "md"
                required type = "number"
                placeholder = 'Price (ETH)' / >
                <
                /Card.Footer> <
                /Card> <
                /Col>
            ))
        } <
        /Row> <
        />
    )
}



export default function MyListedItems({ marketplace, nft, account }) {
    const [loading, setLoading] = useState(true);
    const [listedItems, setListedItems] = useState([]);
    const [soldItems, setSoldItems] = useState([]);
    const [ownedItems, setOwnedItems] = useState([]);
    const loadListedItems = async() => {
        const itemCount = await marketplace.itemCount();
        const nftCount = await nft.tokenCount();
        let listedItems = [];
        let soldItems = [];
        let ownedItems = [];
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

        for (let indx = 1; indx <= nftCount.toNumber(); indx++) {
            const i = await nft.ownerOf(indx);
            console.log(i.toLowerCase());
            console.log(account);
            console.log(nftCount.toNumber())
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
                console.log("aqui")
                ownedItems.push(item);
            }
        }
        setLoading(false);
        setListedItems(listedItems);
        setSoldItems(soldItems);
        setOwnedItems(ownedItems)
    }

    useEffect(() => {
        loadListedItems()
    }, [])

    if (loading) return ( <
        main style = {
            { padding: "1rem 0" } } >
        <
        h2 > Loading... < /h2> <
        /main>
    );
    /* 
        const createOffer = async (item) => {
            await (await marketplace.makeItem(item.nft.address, item.nft.tokenId, 0)).wait();
        } */

    return ( <
        div className = 'flex justify-center' > {
            (listedItems.length > 0 || soldItems.length > 0 || ownedItems.length > 0) ?
            <
            div className = 'px-5 py-3 container' > { listedItems.length > 0 && renderListedItems(listedItems, marketplace) } { soldItems.length > 0 && renderSoldItems(soldItems) } { ownedItems.length > 0 && renderOwnedItems(ownedItems, marketplace, nft) } <
            /div>  :
                ( <
                main style = {
                    { padding: "1rem 0" } } >
                <
                h2 > No assets < /h2> <
                /main>
            )
        } <
        /div>
    );
}