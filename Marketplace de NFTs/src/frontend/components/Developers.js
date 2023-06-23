import { ethers } from 'ethers';
import { Row, Form, Button, Spinner } from 'react-bootstrap';
const Developers = ({ marketplace, nft, account }) => {

    const createONG = async (name, wallet) => {
        try {
            await (await marketplace.setONGWalletAddress(ethers.utils.getAddress(wallet), name)).wait();
        } catch (error) {
            console.log("ONG creation failed.")
        }
    };

    const handleCreateONG = () => {
        const name = document.getElementById('name').value;
        const wallet = document.getElementById('wallet').value;
        try {
            const address = ethers.utils.getAddress(wallet);
            console.log('Ethereum address:', address);
            createONG(name, wallet);
        } catch (error) {
            console.error('Invalid Ethereum address:', error.message);
        }
    };

    return (
        <div className="container-fluid mt-5">
            <h1>Marketplace Settings</h1>
            <h2>Add new ONG</h2>
            <div className='row px-5 py-5'>
                <main role="main" className='col-lg-12 mx-auto' style={{ maxWidth: '1000px' }}>
                    <div className='content mx-auto'>
                        <Row className='g-2 form-container align-items-center'>
                            <Form.Label htmlFor="name">Name</Form.Label>
                            <Form.Control type="text" id="name" name="name" style={{ width: '500px' }} />
                        </Row>
                        <Row className='g-2 form-container'>
                            <Form.Label htmlFor="wallet">Metamask Wallet</Form.Label>
                            <Form.Control type="text" id="wallet" name="wallet" style={{ width: '500px' }} />
                        </Row>
                        <div className='g-grid px-0'>
                            <Button onClick={handleCreateONG} size="md" variant="primary" style={{ marginTop: '10px', backgroundColor: '#333333' }}>
                                Create ONG
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Developers;