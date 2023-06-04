import { ethers } from 'ethers';

const Developers = ({ marketplace, nft, account }) => {

    const createONG = async (name, wallet) => {
        await (await marketplace.setONGWalletAddress(ethers.utils.getAddress(wallet), name)).wait();
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
        <div>
            <div style={{ marginTop: '20px' }}>
                <h1>Marketplace Settings</h1>
            </div>

            <div style={{ marginTop: '20px' }}>
                <h2>Add new ONG</h2>
            </div>

            <div style={{ marginTop: '20px' }}>
                <form>
                    <div style={{ marginBottom: '10px' }}>
                        <label htmlFor="name">Name:  &nbsp;</label>
                        <input type="text" id="name" name="name" />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label htmlFor="wallet">Metamask Wallet: &nbsp;</label>
                        <input type="text" id="wallet" name="wallet" />
                    </div>

                    <button type="button" onClick={handleCreateONG}>Submit</button>
                </form>
            </div>
        </div>
    );
}

export default Developers;