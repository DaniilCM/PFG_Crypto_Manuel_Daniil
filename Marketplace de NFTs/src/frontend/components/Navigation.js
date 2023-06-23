import { Link } from "react-router-dom";
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import logo from './img/logo.png';

const Navigation = ({ web3Handler, account, owner }) => {

    console.log(account);
    console.log(owner);
    let addressIsDeveloper = null;
    if (account != null && owner != null && account.toLowerCase() == owner.toLowerCase()) {
        addressIsDeveloper = true;
    }
    else {
        addressIsDeveloper = false;
    }
    return (
        <Navbar expand="lg" className="custom-navbar">
            <Container>
                <Navbar.Brand className="text-white">
                    <img src={logo} width="40" height="50" className="" alt="Logo" />
                    &nbsp; Marketplace
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="navbar navbar-light bg-primary" />
                <Navbar.Collapse id="navbar navbar-light bg-primary">
                    <Nav className="me-auto mx-auto"> {/* Agrega la clase "mx-auto" para centrar los elementos */}
                        <Nav.Link as={Link} to="/" className="text-white nav-link"> Market </Nav.Link>
                        <Nav.Link as={Link} to="/createNFT" className="text-white nav-link"> Create NFT </Nav.Link>
                        <Nav.Link as={Link} to="/profile" className="text-white nav-link"> Profile </Nav.Link>
                        {   
                            addressIsDeveloper && (
                            
                            <Nav.Link as={Link} to="/my_settings" className="text-white"> Developers </Nav.Link>)
                        }
                    </Nav>
                    <Nav>
                        {account ? (
                            <Nav.Link
                                href={`https://etherscan.io/address/${account}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="button nav-button btn-sm mx-4">
                                <Button variant="outline-light">
                                    {account}
                                </Button>
                            </Nav.Link>
                        ) : (
                            <Button onClick={web3Handler} variant="outline-light">
                                Connect Wallet
                            </Button>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default Navigation;