# Technical Exam for AR Data

A full-stack blockchain decentralized application (dApp) demonstrating wallet integration, smart contract interaction, and blockchain data retrieval with caching capabilities.

## Overview

This project is a comprehensive blockchain application consisting of three main components:

- **Frontend**: Next.js application for connecting MetaMask wallets, viewing transaction history, and interacting with ERC20 tokens
- **Backend**: NestJS REST API that integrates with Etherscan API and implements Redis caching for improved performance
- **Smart Contracts**: Hardhat-based ERC20 token contract (`OgamaToken`) with minting and transfer capabilities

The application demonstrates a complete workflow from wallet connection, blockchain data retrieval, to token contract interactions.

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **Ethers.js v6** - Ethereum JavaScript library
- **Radix UI** - Accessible component primitives
- **TypeScript** - Type-safe JavaScript

### Backend
- **NestJS** - Progressive Node.js framework
- **Axios** - HTTP client for API requests
- **Ethers.js v6** - Address validation and unit formatting
- **Redis** - In-memory caching layer
- **Drizzle ORM** - TypeScript ORM for database operations
- **TypeScript** - Type-safe JavaScript

### Smart Contracts
- **Hardhat 3** - Ethereum development environment
- **Solidity 0.8.28** - Smart contract language
- **OpenZeppelin Contracts** - Secure smart contract libraries
- **Hardhat Ignition** - Declarative deployment system
- **TypeChain** - TypeScript bindings for smart contracts

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v22 or higher recommended)
- **npm** (comes with Node.js)
- **Docker** and **Docker Compose** (optional, for containerized setup)
- **MetaMask** browser extension (for wallet connection)
- **Redis** (for backend caching, or use Docker)

## Project Structure

```
ardata-tech-exam/
├── frontend/          # Next.js frontend application
├── backend/           # NestJS backend API
├── contracts/         # Hardhat smart contract project
├── docker/            # Docker Compose configuration
└── readme.md          # This file
```

## Setup Instructions

### Option 1: Local Development (Recommended for Development)

#### Tier 1: Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `frontend` directory:
   ```env
   NEXT_PUBLIC_ETHERS_API_KEY=your_etherscan_api_key
   NEXT_PUBLIC_RPC_URL=http://localhost:8545
   NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

#### Tier 2: Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory:
   ```env
   ETHERS_SCAN_API_KEY=your_etherscan_api_key
   REDIS_HOST=localhost
   REDIS_PORT=6379
   PORT=3001
   ```

4. Ensure Redis is running (or start it with Docker):
   ```bash
   docker run -d -p 6379:6379 redis:latest
   ```

5. Start the development server:
   ```bash
   npm run start:dev
   ```

   The API will be available at [http://localhost:3001](http://localhost:3001)

#### Tier 3: Smart Contract Setup

1. Navigate to the contracts directory:
   ```bash
   cd contracts
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start a local Hardhat node:
   ```bash
   npx hardhat node
   ```

   This will start a local blockchain node on `http://localhost:8545` with 20 test accounts, each pre-funded with 10,000 GO (GoChain testnet settings, Chain ID 82).

4. In a new terminal, deploy the contract:
   ```bash
   npx hardhat ignition deploy ignition/modules/Token.ts --network localhost
   ```

5. Copy the deployed contract address and update your frontend `.env` file with `NEXT_PUBLIC_CONTRACT_ADDRESS`

#### Tier 4: Full Integration

1. Start the Hardhat node (from `contracts` directory):
   ```bash
   npx hardhat node
   ```

2. Deploy the contract (if not already deployed):
   ```bash
   npx hardhat ignition deploy ignition/modules/Token.ts --network localhost
   ```

3. Start the frontend (from `frontend` directory):
   ```bash
   npm run dev
   ```

4. Navigate to [http://localhost:3000/tier4](http://localhost:3000/tier4) to interact with the token contract

### Option 2: Docker Compose (Recommended for Production-like Setup)

1. Navigate to the docker directory:
   ```bash
   cd docker
   ```

2. Ensure you have `.env` files in both `frontend` and `backend` directories (see setup instructions above)

3. Build and start all services:
   ```bash
   docker-compose up --build
   ```

   This will start:
   - Frontend on [http://localhost:3000](http://localhost:3000)
   - Backend on [http://localhost:3001](http://localhost:3001)
   - Hardhat node on [http://localhost:8545](http://localhost:8545) (with automatic contract deployment)

4. To stop all services:
   ```bash
   docker-compose down
   ```

## Environment Variables

### Frontend (`frontend/.env`)
- `NEXT_PUBLIC_ETHERS_API_KEY` - Etherscan API key for fetching transaction data
- `NEXT_PUBLIC_RPC_URL` - RPC endpoint URL (default: `http://localhost:8545` for local development)
- `NEXT_PUBLIC_CONTRACT_ADDRESS` - Deployed OgamaToken contract address

### Backend (`backend/.env`)
- `ETHERS_SCAN_API_KEY` - Etherscan API key for backend requests
- `REDIS_HOST` - Redis server hostname (default: `localhost`)
- `REDIS_PORT` - Redis server port (default: `6379`)
- `PORT` - Backend server port (default: `3001`)

### Contracts
- Network-specific variables can be set in `hardhat.config.ts` or via environment variables for testnet deployments

## Key Features

### Frontend
- **Wallet Connection**: MetaMask integration for connecting Ethereum wallets
- **Transaction History**: Display of wallet transaction history via Etherscan API
- **Token Interaction**: Mint and transfer ERC20 tokens through the `/tier4` page
- **Real-time Balance**: Display of wallet ETH balance and token balance

### Backend
- **Etherscan Integration**: Fetch account balance, block number, and gas price
- **Redis Caching**: 60-second TTL cache for API responses to reduce external API calls
- **RESTful API**: `/eth/account?address=<address>` endpoint for account information

### Smart Contracts
- **ERC20 Token**: Standard ERC20 implementation with `OgamaToken` (OG)
- **Minting**: Owner-only minting function for token creation
- **Transfer**: Standard ERC20 transfer functionality

## API Endpoints

### Backend API

- `GET /eth/account?address=<address>` - Get account information (balance, block number, gas price)
  - Returns cached data if available (within 60 seconds)
  - Example: `http://localhost:3001/eth/account?address=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`

## Architectural Decisions

1. **Redis Caching**: Implemented 60-second TTL caching for Etherscan API responses to reduce rate limiting and improve response times

2. **Hardhat Ignition**: Used for declarative contract deployments, making deployments reproducible and version-controlled

3. **GoChain Network Settings**: Local Hardhat network configured with GoChain testnet settings (Chain ID 82) to match production-like environment

4. **TypeScript Throughout**: Full TypeScript implementation across frontend, backend, and contracts for type safety

5. **Separation of Concerns**: Frontend handles wallet interactions, backend handles API integrations and caching, contracts handle on-chain logic

6. **Direct Etherscan Integration**: Frontend directly calls Etherscan API for transaction history to reduce backend load

## Known Issues and Limitations

1. **Network Mismatch**: Ensure MetaMask is connected to the same network as your Hardhat node (Chain ID 82 for local development)

2. **Contract Deployment**: The contract must be deployed before using the `/tier4` page. Update `NEXT_PUBLIC_CONTRACT_ADDRESS` in your frontend `.env` file after deployment

3. **Redis Dependency**: Backend requires Redis to be running. If Redis is unavailable, the API will still function but without caching

4. **Etherscan Rate Limits**: Free Etherscan API keys have rate limits. Consider upgrading for production use

5. **Local Network Persistence**: Hardhat node data is not persisted between restarts. All transactions and deployments are reset

6. **MetaMask Connection**: Users must have MetaMask installed and configured to use wallet features

## Development Commands

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend
```bash
npm run start:dev    # Start development server with hot reload
npm run build        # Build for production
npm run start:prod   # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Contracts
```bash
npx hardhat compile              # Compile contracts
npx hardhat test                 # Run tests
npx hardhat node                 # Start local node
npx hardhat ignition deploy ... # Deploy contracts
```

## Testing

### Frontend
Navigate to the application and test:
- Wallet connection on the home page
- Transaction history display
- Token minting and transfer on `/tier4` page

### Backend
Test the API endpoint:
```bash
curl "http://localhost:3001/eth/account?address=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
```

### Contracts
Run Hardhat tests:
```bash
cd contracts
npx hardhat test
```

## Troubleshooting

### Frontend Issues
- **"Could not decode result data"**: Verify the contract is deployed and `NEXT_PUBLIC_CONTRACT_ADDRESS` is correct
- **Wallet connection fails**: Ensure MetaMask is installed and unlocked
- **Network mismatch**: Check that MetaMask is on the correct network (Chain ID 82 for local)

### Backend Issues
- **Redis connection error**: Ensure Redis is running on the configured host and port
- **Etherscan API errors**: Verify your API key is valid and not rate-limited

### Contract Issues
- **Deployment fails**: Ensure the Hardhat node is running and accessible
- **Insufficient funds**: Verify test accounts have sufficient balance (should have 10,000 GO each)

## License

This project is part of a technical examination and is provided as-is.

## Contributing

This is a technical exam project. For questions or issues, please refer to the project requirements or contact the exam administrator.
