import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import abi from "./abi.json";
import "./App.css";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [wallet, setWallet] = useState("");
  const [contract, setContract] = useState(null);
  const [identityAddress, setIdentityAddress] = useState("");
  const [identityHash, setIdentityHash] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        setMessage("Please install MetaMask first.");
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const network = await provider.getNetwork();

      if (network.chainId !== 31337n) {
        setMessage(
          "Please switch MetaMask to your local Anvil network (Chain ID 31337)."
        );
        return;
      }

      const contractInstance = new Contract(
        CONTRACT_ADDRESS,
        abi,
        signer
      );

      setWallet(address);
      setContract(contractInstance);
      setMessage("Wallet connected to TrustID successfully!");
    } catch (error) {
      setMessage(error.shortMessage || error.message || "Connection failed.");
    }
  }

  async function checkIdentity() {
    try {
      if (!contract) {
        setMessage("Connect your wallet first.");
        return;
      }

      if (!identityAddress.trim()) {
        setMessage("Enter the wallet address you want to check.");
        return;
      }

      setLoading(true);
      setMessage("");

      const verified = await contract.isVerified(identityAddress);

      setVerificationStatus(
        verified ? "Verified" : "Not verified"
      );

      setMessage("Identity status retrieved from the blockchain.");
    } catch (error) {
      setMessage(error.shortMessage || error.message || "Could not check status.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyIdentity() {
    try {
      if (!contract) {
        setMessage("Connect the authorized verifier wallet first.");
        return;
      }

      if (!identityAddress.trim() || !identityHash.trim()) {
        setMessage("Enter the wallet address and identity hash.");
        return;
      }

      setLoading(true);
      setMessage("Please confirm the transaction in MetaMask.");

      const tx = await contract.verifyIdentity(
        identityAddress,
        identityHash
      );

      setMessage("Transaction submitted. Waiting for confirmation...");

      await tx.wait();

      setVerificationStatus("Verified");
      setMessage("Identity successfully verified on the local blockchain.");
    } catch (error) {
      setMessage(error.shortMessage || error.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function revokeIdentity() {
    try {
      if (!contract) {
        setMessage("Connect the authorized verifier wallet first.");
        return;
      }

      if (!identityAddress.trim()) {
        setMessage("Enter the wallet address.");
        return;
      }

      setLoading(true);
      setMessage("Please confirm the transaction in MetaMask.");

      const tx = await contract.revokeIdentity(identityAddress);

      setMessage("Transaction submitted. Waiting for confirmation...");

      await tx.wait();

      setVerificationStatus("Not verified");
      setMessage("Identity verification revoked.");
    } catch (error) {
      setMessage(error.shortMessage || error.message || "Revocation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-icon">T</span>
          <span>TrustID</span>
        </a>

        <button className="connect-button" onClick={connectWallet}>
          {wallet
            ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
            : "Connect Wallet"}
        </button>
      </header>

      <section className="hero">
        <p className="eyebrow">DECENTRALIZED IDENTITY</p>

        <h1>
          Your identity.
          <br />
          <span>Your control.</span>
        </h1>

        <p className="hero-description">
          Check and manage identity verification status through a smart
          contract on your local development blockchain.
        </p>
      </section>

      <section className="identity-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">IDENTITY DASHBOARD</p>
            <h2>Verification Center</h2>
          </div>
          <span className="status-dot">
            {wallet ? "Connected" : "Disconnected"}
          </span>
        </div>

        <label htmlFor="identityAddress">Wallet address to check</label>
        <input
          id="identityAddress"
          type="text"
          placeholder="0x..."
          value={identityAddress}
          onChange={(e) => setIdentityAddress(e.target.value)}
        />

        <label htmlFor="identityHash">Identity hash (verifier only)</label>
        <input
          id="identityHash"
          type="text"
          placeholder="0x followed by 64 hexadecimal characters"
          value={identityHash}
          onChange={(e) => setIdentityHash(e.target.value)}
        />

        <div className="button-row">
          <button onClick={checkIdentity} disabled={loading}>
            Check Status
          </button>

          <button onClick={verifyIdentity} disabled={loading}>
            Verify Identity
          </button>

          <button
            className="secondary-button"
            onClick={revokeIdentity}
            disabled={loading}
          >
            Revoke
          </button>
        </div>

        {verificationStatus && (
          <div className="result">
            <span>Verification result</span>
            <strong>{verificationStatus}</strong>
          </div>
        )}

        {message && <p className="message">{message}</p>}

        {loading && <p className="message">Processing...</p>}
      </section>

      <section className="notice">
        <strong>Development demo</strong>
        <p>
          This version runs on a local test blockchain. It does not perform
          official identity checks. Never enter real identification documents,
          national identification numbers, or other sensitive personal data.
          Use a test wallet address and a dummy identity hash.
        </p>
      </section>

      <footer>
        TrustID · Built with React, Ethers.js, Solidity, and Foundry
      </footer>
    </main>
  );
}

export default App;