import './styles.css';
import React, { useState } from 'react';
import { BrowserProvider } from 'ethers';
import Vote from './Vote';

function App() {
  const contractAddress = '0xfc6B1eE12B3a5503D46196ceBbfb6affF54B657C';
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const browserProvider = new BrowserProvider(window.ethereum);
        await browserProvider.send("eth_requestAccounts", []);
        const signer = await browserProvider.getSigner();
        setProvider(browserProvider);
        setAccount(await signer.getAddress());
      } catch (error) {
        console.error("Wallet connection failed:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  return (
    <div>
      <header className="app-header">
        <h1>Voting DApp</h1>
        <button className="connect-wallet" onClick={connectWallet}>
          {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
        </button>
      </header>
      {account && provider && (
        <Vote contractAddress={contractAddress} />
      )}
    </div>
  );
}

export default App;