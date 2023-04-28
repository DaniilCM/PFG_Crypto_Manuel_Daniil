import { useState } from 'react';
import { ethers } from 'ethers';
import { Row, Form, Button } from 'react-bootstrap';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { Buffer } from 'buffer';

const projectId = '2OtO2fObLtv9Md4qE19rdqyJxrq';
const projectSecret = 'f7b475f45711341b8bd2527d8f822771';
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const client = ipfsHttpClient({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    apiPath: '/api/v0',
    headers: {
        authorization: auth
    }
});

const Create = ({ marketplace, nft }) => {
    const [image, setImage] = useState('');
    const [price, setPrice] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const uploadToIPFS = async(event) => {
        event.preventDefault();
        const file = event.target.files[0];
        if (typeof file !== 'undefined') {
            try {
                const result = await client.add(file);
                console.log(result);
                setImage(`https://marketplacenftupm.infura-ipfs.io/ipfs/${result.path}`);
            } catch (error) {
                console.log("ipfs image upload error: ", error);
            }
        }
    }
    const createNFTAndList = async() => {
        if (!image || !price || !name || !description) return
        try {
            const result = await client.add(JSON.stringify({ image, price, name, description }));
            mintThenList(result);
        } catch (error) {
            console.log("ipfs uri uload error: ", error);
        }
    }
    const createNFT = async() => {
        if (!image || !price || !name || !description) return
        try {
            const result = await client.add(JSON.stringify({ image, price, name, description }));
            mintOnly(result);
        } catch (error) {
            console.log("ipfs uri uload error: ", error);
        }
    }
    const mintThenList = async(result) => {
        const uri = `https://marketplacenftupm.infura-ipfs.io/ipfs/${result.path}`;
        await (await nft.mint(uri)).wait();
        const id = await nft.tokenCount();
        await (await nft.setApprovalForAll(marketplace.address, true));
        const listingPrice = ethers.utils.parseEther(price.toString());
        await (await marketplace.makeItem(nft.address, id, listingPrice)).wait();
    }
    const mintOnly = async(result) => {
        const uri = `https://marketplacenftupm.infura-ipfs.io/ipfs/${result.path}`;
        await (await nft.mint(uri)).wait();
        await (await nft.setApprovalForAll(marketplace.address, true));
    }

    return (
        <div className="container-fluid mt-5">
            <h2>Create your own NFT!</h2>
            <div className='row px-5 py-5'>
                <main role="main" className='col-lg-12 mx-auto' style={{ maxWidth: '1000px' }}>
                    <div className='content mx-auto'>
                        <Row className='g-4'>
                            <Form.Control type="file" required name="file" onChange={uploadToIPFS} />
                            <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
                            <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" />
                            <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder='Price (ETH)' />
                            <div className='g-grid px-0'>
                                <Button onClick={createNFT} variant="success" size="lg" style={{ marginRight: 50 }}>Create!</Button>
                                <Button onClick={createNFTAndList} variant="primary" size="lg">Create and list NFT!</Button>
                            </div>
                        </Row>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Create;