import { useState } from 'react';
import { ethers } from 'ethers';
import { Row, Form, Button, Spinner } from 'react-bootstrap';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { Buffer } from 'buffer';
import { findAllInRenderedTree } from 'react-dom/test-utils';

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

const CreateNFT = ({ marketplace, nft }) => {
    const [image, setImage] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState('');
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [nftFile, setNftFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false); 

    const uploadToIPFS = async (event) => {
        event.preventDefault();
        const file = event.target.files[0];

        setSelectedFile(file);

        if (file) {
            setNftFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewImage(null);
        }

    }

    const create = async () => {
        if (!name || !description) return
        try {
            setIsLoading(true); // Establecer isLoading en true al iniciar la creación
            if (typeof nftFile !== 'undefined') {
                try {
                    const nftImage = await client.add(nftFile);
                    let image = `https://marketplacenftupm.infura-ipfs.io/ipfs/${nftImage.path}`;
                    console.log(image);
                    console.log(nftImage);
                    const result = await client.add(JSON.stringify({image, name, description}));
                    mint(result);
                } catch (error) {
                    console.log("ipfs image upload error: ", error);
                }
            }
        } catch (error) {
            console.log("ipfs uri uload error: ", error);
        } finally {
            setIsLoading(false); 
        }
    }

    const mint = async (result) => {
        try{
        const uri = `https://marketplacenftupm.infura-ipfs.io/ipfs/${result.path}`;
        console.log(uri);
        await (await nft.setApprovalForAll(marketplace.address, true));
        await (await nft.mint(uri)).wait();
        } catch (error){
            console.log("NFT creation failed.");
        }
    }

    return (
        <div className="container-fluid mt-5">
            <h2>Create your own NFT!</h2>
            <div className='row px-5 py-5'>
                <main role="main" className='col-lg-12 mx-auto' style={{ maxWidth: '1000px' }}>
                    <div className='content mx-auto'>
                        <Row className='g-2 form-container'>
                            <Form.Control type="file" required name="file" onChange={uploadToIPFS} style={{ width: '500px' }} />
                            <Row className='g-2 form-container'>
                                <Form.Control onChange={(e) => setName(e.target.value)} size="md" required type="text" placeholder="Name" style={{ width: '500px' }} />
                            </Row>
                            <Row className='g-2 form-container'>
                                <Form.Control onChange={(e) => setDescription(e.target.value)} size="md" required as="textarea" placeholder="Description" style={{ width: '500px' }} />
                            </Row>
                            <Row className='g-2 form-container'>
                                {previewImage && (
                                    <div className="preview-container">
                                        <div className="preview-image-wrapper">
                                            <img src={previewImage} alt="Preview" className="preview-image" />
                                        </div>
                                    </div>
                                )}
                            </Row>
                            <div className='g-grid px-0'>
                                <Button onClick={create} size="lg" variant="primary" style={{ marginTop: '10px', backgroundColor: '#333333' }}>
                                {isLoading ? ( 
                                        <Spinner animation="border" role="status" size="md" >
                                            <span className="visually-hidden">Loading...</span>
                                        </Spinner>
                                    ) : (
                                        'Create NFT' 
                                    )}
                                </Button>
                            </div>
                        </Row>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default CreateNFT;