# Gasless-VotingDApp

**Gasless-VotingDApp** is a decentralized voting application built on Ethereum, designed to provide a gasless user experience using Gelato Relay's `sponsoredCallERC2771`. Users can create proposals and vote without needing ETH, thanks to Gelato's sponsored transactions. The application is live on the Sepolia testnet and uses ERC-2771 meta-transactions to enable seamless and user-friendly voting.

## Features

- **Proposal Creation**: Users can create new proposals by providing a title and description.
- **Voting on Proposals**: Cast votes either in support or opposition of a proposal.
- **Gasless Transactions**: Leveraging Gelato Relay's `sponsoredCallERC2771` function, users can interact with the DApp without bearing the gas fees.
- **Real-time Status Update**: Proposal statuses update in real-time as new proposals are created or votes are cast.
- **Wallet Integration**: Connect and manage interactions through MetaMask.

## Technologies Used

- **Solidity**: Smart contract language used for the Voting contract.
- **React.js**: Frontend framework for creating the user interface.
- **ethers.js**: JavaScript library for Ethereum interaction.
- **Gelato Relay**: Used for sponsored calls, enabling gasless transactions via ERC-2771 meta-transactions.
- **Sepolia Testnet**: Ethereum testnet used for deploying and testing the contract.

## Prerequisites

1. **MetaMask**: Ensure you have MetaMask installed and connected to the Sepolia testnet.
2. **Sepolia Faucet**: To interact with the DApp, request Sepolia test ETH.
3. **Node API**: Access Sepolia nodes via [Etherscan](https://etherscan.io/apis) if you need direct interaction.
4. 
## Contract Information
The **Gasless-VotingDApp** is deployed on the Sepolia test network. You can view and interact with the smart contract using the following details:

- **Contract Address**: [0xfc6B1eE12B3a5503D46196ceBbfb6affF54B657C]
- **Etherscan Link**:[https://sepolia.etherscan.io//address/0xfc6b1ee12b3a5503d46196cebbfb6afff54b657c/advanced#internaltx]

This link provides transparency and allows you to explore the transactions and contract interactions on the blockchain.

## Setup and Installation

1. **Clone this repository**:
   ```bash
   git clone https://github.com/Hany-Almnaem/Gasless-VotingDApp.git
   cd Gasless-VotingDApp
   ```

2. **Install dependencies for both the frontend and backend**:
   ```bash
   # Install frontend dependencies
   cd react
   npm install
   cd ../hardhat
   npm install
   ```

3. **Configuration**:
   - In the React frontend, create a `.env` file and add your Gelato API key:
     ```plaintext
     REACT_APP_GELATO_API_KEY=your-gelato-api-key
     ```
   - Update `contractAddress` in the frontend files to match your deployed Voting contract address on Sepolia.

4. **Running the Application**:
   - Start the frontend:
     ```bash
     cd react
     npm start
     ```

## How to Use

1. **Connect Wallet**: 
   - Open the DApp, click on “Connect Wallet,” and connect to MetaMask on the Sepolia network.

2. **Create a Proposal**:
   - Navigate to the “Create Proposal” section.
   - Enter a title and description, then click “Create Proposal.”
   - Once created, the proposal will appear in the list below.

3. **Vote on a Proposal**:
   - In the “Vote on Proposal” section, enter the Proposal ID, select “Vote For” or “Vote Against,” and submit your vote.
   - A transaction confirmation will display once the vote is processed.

## Gelato Relay Integration

This DApp uses Gelato Relay’s `sponsoredCallERC2771` for gasless transactions. Here’s a brief overview of how it works:

- **ERC-2771 Meta-Transactions**: Our Voting smart contract inherits `ERC2771Context`, enabling it to validate meta-transactions through a trusted forwarder (Gelato’s relay).
- **sponsoredCallERC2771**: This function allows users to interact with the DApp without needing ETH. It takes care of transaction gas fees by relaying them through Gelato's infrastructure.

### Example Code Snippets

**Proposal Creation** in `Vote.js`:
```javascript
const data = contract.interface.encodeFunctionData('createProposal', [proposalTitle, proposalDescription]);
const relayResponse = await relay.sponsoredCallERC2771(request, provider, gelatoApiKey);
```

**Voting** in `Vote.js`:
```javascript
const data = contract.interface.encodeFunctionData('voteOnProposal', [proposalId, support]);
const relayResponse = await relay.sponsoredCallERC2771(request, provider, gelatoApiKey);
```
## Project Demo

### Creating a Proposal
<img src=".assets/create-proposal.gif" width="600px" alt="Creating a Proposal" />

### Voting on a Proposal
<img src=".assets/vote.gif" width="600px" alt="Voting on a Proposal" />

### Etherscan Transaction Confirmation
<img src=".assets/Screen-Shot-2024-11-09-at-3.28.15-PM.png" width="600px" alt="Etherscan Transaction Confirmation" />

