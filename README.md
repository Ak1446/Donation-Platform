# Donation DApp

A decentralized application for creating and donating to crowdfunding campaigns on the Base network.

## Features

- Create donation campaigns with title, description, and image
- View all active campaigns
- Donate ETH to campaigns
- View campaign details and donation history
- Connect MetaMask wallet

## Prerequisites

- Node.js (v14 or higher)
- MetaMask wallet with Base network configured
- Deployed smart contract on Base network

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd donation-dapp
```

2. Install dependencies:
```bash
npm install
```

3. Configure the contract:
   - Open `src/contracts/contract.js`
   - Replace `YOUR_CONTRACT_ADDRESS` with your deployed contract address on Base

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Smart Contract

The DApp interacts with a smart contract deployed on the Base network. The contract should implement the following functions:

- `createCampaign(title, description, image)`
- `donateToCampaign(id)`
- `getAllCampaigns()`
- `campaigns(id)`

## Technologies Used

- React
- ethers.js
- Tailwind CSS
- React Router
- MetaMask

## License

MIT 