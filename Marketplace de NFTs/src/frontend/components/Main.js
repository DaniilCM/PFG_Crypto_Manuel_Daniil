import {
    BrowserRouter,
    Routes,
    Route
} from 'react-router-dom';

import Navigation from './Navigation';
import Market from './Market';
import CreateNFT from './CreateNFT';
import Profile from './Profile';
import Developers from './Developers';
import MarketplaceAbi from '../contractsData/Marketplace.json';
import MarketplaceAddress from '../contractsData/Marketplace-address.json';
import NFTAbi from '../contractsData/NFT.json';
import NFTAddress from '../contractsData/NFT-address.json';
import { useState } from 'react';
import { ethers } from 'ethers';
import { Spinner } from 'react-bootstrap';
import './Main.css';

function Main() {

    const [loading, setLoading] = useState(true);
    const [account, setAccount] = useState(null);
    const [nft, setNFT] = useState({});
    const [marketplace, setMarketplace] = useState({});
    const [owner, setOwner] = useState(null);
    const [ongs, setOngs] = useState(null);
    const web3Handler = async () => {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log(accounts)
            setAccount(accounts[0]);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            window.ethereum.on('chainChanged', (chainId) => {
                window.location.reload();
            })

            window.ethereum.on('accountsChanged', async function (accounts) {
                setAccount(accounts[0]);
                window.location.reload();
                window.location.href = window.location.origin + '/';
                await web3Handler();
            })

            loadContracts(signer);
        } catch (error) {
            console.log("Login failed.")
        }
    }

    const loadContracts = async (signer) => {
        try {
            const marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, signer);
            setMarketplace(marketplace);
            const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer);
            setNFT(nft);
            setLoading(false);
            setOwner(await marketplace.getFeeAccountAddress());
        } catch (error) {
            console.log("Marketplace connection failed.");
        }
    }

    window.onload = (event) => {
        web3Handler();
    };

    return (
        <BrowserRouter>
            <div className='App'>
                <>
                    <Navigation web3Handler={web3Handler} account={account} owner={owner} />
                </>
                <div>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                            <Spinner animation='border' style={{ display: 'flex' }} />
                            <p className='mx-3 my-0'>Waiting for Metamask's connection...</p>
                        </div>
                    ) : (
                        <Routes>
                            <Route
                                path='/'
                                element={<Market marketplace={marketplace} nft={nft} />}
                            />
                            <Route
                                path='/createNFT'
                                element={<CreateNFT marketplace={marketplace} nft={nft} />}
                            />
                            <Route
                                path='/profile'
                                element={
                                    <Profile marketplace={marketplace} nft={nft} account={account} />
                                }
                            />
                            <Route
                                path='/my_settings'
                                element={<Developers marketplace={marketplace} nft={nft} account={account} />}
                            />
                        </Routes>
                    )}
                </div>
            </div>
        </BrowserRouter>
    );
}

export default Main;