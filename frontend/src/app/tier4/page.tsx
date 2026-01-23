"use client";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useConnectWallet } from "@/hooks/useConnectWallet";
import {  EtherscanResponse } from "@/service/ether-scan";
import { InfoIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { ethers, formatEther } from "ethers";
import OgamaToken from "@/abi/OgamaToken.json"

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL!
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!

export default function Tier4Page() {
  const [error, setError] = useState<string>("");
  const [balance, setBalance] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [txHistory, setTxHistory] = useState<EtherscanResponse>();
  const [loading, setLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [ownerAdd, setOwnerAdd] = useState<string>("")

  const { connectWallet } = useConnectWallet();

  useEffect(() => {
    setMounted(true);
  }, []);

  const walletConnect = async () => {
    try {
      setLoading(true);

      const { address,  error } = await connectWallet();

      if (error !== null) {
        setError(error);
      }

      if (!address ) {
        setError("Something went wrong");
        return;
      }

      const rpcProvider = new ethers.JsonRpcProvider(RPC_URL);

      const contractRead = new ethers.Contract(
        CONTRACT_ADDRESS,
        OgamaToken.abi,
        rpcProvider,
      );

      const balance = await contractRead.balanceOf(address)

      setWalletAddress(address);
      setBalance(formatEther(balance));

      setIsWalletConnected(true);
    } catch (error) {
      console.error("error wallet connect", error);
      setIsWalletConnected(false);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const mintToken = async () => {
    try {
      setLoading(true);
      setError('');

      if (!RPC_URL) {
        setError('RPC URL not configured. Please set NEXT_PUBLIC_RPC_URL');
        return;
      }

      if (!CONTRACT_ADDRESS || !ethers.isAddress(CONTRACT_ADDRESS)) {
        setError('Invalid contract address. Please check NEXT_PUBLIC_CONTRACT_ADDRESS');
        return;
      }

      const { address, error: walletError } =
        await connectWallet();

      if (walletError) {
        setError(walletError);
        return;
      }

      const rpcProvider = new ethers.JsonRpcProvider(RPC_URL);
      const signer = await rpcProvider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        OgamaToken.abi,
        signer,
      );

      const contractRead = new ethers.Contract(
        CONTRACT_ADDRESS,
        OgamaToken.abi,
        rpcProvider,
      );

      const balance = await contractRead.balanceOf(address);
      setBalance(formatEther(balance));
      console.log('Current balance:', formatEther(balance));

      const mintAmount = 500;
      console.log('Minting', mintAmount, 'tokens to', address);
      const tx = await contract.mint(address, mintAmount);
      console.log('Transaction hash:', tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction confirmed in block:', receipt.blockNumber);

      const newBalance = await contractRead.balanceOf(address);
      console.log('New balance:', newBalance.toString());

      const ownerAddress = await contract.owner()
      setOwnerAdd(ownerAddress)


      setError('');
    } catch (error) {
      console.error('Mint error:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to mint tokens. Make sure you are the contract owner.',
      );
    } finally {
      setLoading(false);
    }
  };

  const transferToken = async () => {
    try {
      setLoading(true);
      setError('');

      if (!RPC_URL) {
        setError('RPC URL not configured. Please set NEXT_PUBLIC_RPC_URL');
        return;
      }

      if (!CONTRACT_ADDRESS || !ethers.isAddress(CONTRACT_ADDRESS)) {
        setError('Invalid contract address. Please check NEXT_PUBLIC_CONTRACT_ADDRESS');
        return;
      }

      const { address,  error: walletError } = await connectWallet();

      if (walletError) {
        setError(walletError);
        return;
      }

      if (!address ) {
        setError('Wallet not connected');
        return;
      }

      const recipientAddress = prompt('Enter recipient address:');
      if (!recipientAddress) {
        setError('Recipient address is required');
        return;
      }

      if (!ethers.isAddress(recipientAddress)) {
        setError('Invalid recipient address');
        return;
      }

      const amountInput = prompt('Enter amount to transfer:');
      if (!amountInput) {
        setError('Amount is required');
        return;
      }

      const amount = parseFloat(amountInput);
      if (isNaN(amount) || amount <= 0) {
        setError('Invalid amount. Please enter a positive number');
        return;
      }

      const rpcProvider = new ethers.JsonRpcProvider(RPC_URL);
      const signer = await rpcProvider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        OgamaToken.abi,
        signer,
      );

      const contractRead = new ethers.Contract(
        CONTRACT_ADDRESS,
        OgamaToken.abi,
        rpcProvider,
      );

      const tokenBalance = await contractRead.balanceOf(address);
      const tokenBalanceFormatted = formatEther(tokenBalance);
      console.log('Current token balance:', tokenBalanceFormatted);

      const decimals = await contractRead.decimals();
      const amountToTransfer = ethers.parseUnits(amountInput, decimals);

      if (tokenBalance < amountToTransfer) {
        setError(
          `Insufficient balance. You have ${tokenBalanceFormatted} tokens, ` +
          `but trying to transfer ${amount} tokens.`,
        );
        return;
      }

      const ethBalance = await rpcProvider.getBalance(address);
      if (ethBalance === BigInt(0)) {
        setError('Insufficient ETH for gas fees. Please add ETH to your wallet.');
        return;
      }

      console.log('Transferring', amount, 'tokens to', recipientAddress);
      const tx = await contract.transfer(recipientAddress, amountToTransfer);
      console.log('Transaction hash:', tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction confirmed in block:', receipt.blockNumber);

      const newBalance = await contractRead.balanceOf(address);
      console.log('New token balance:', formatEther(newBalance));
      setBalance(formatEther(newBalance));
      alert(`Success tranfer token to: ${recipientAddress}`)

      setError('');
    } catch (error) {
      console.error('Transfer error:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to transfer tokens. Please check your balance and try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) {
    return (
      <div className="h-screen w-full flex justify-center items-center">
        <Button disabled>Loading...</Button>
      </div>
    );
  }

  if (!isWalletConnected) {
    return (
      <div className="h-screen w-full flex justify-center items-center">
        <Button disabled={loading} onClick={walletConnect}>
          {loading && <Spinner />}Connect Metamask
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-4 lg:max-w-200 lg:mx-auto">
      <div className="py-8 space-y-3">
        <div className="flex items-center gap-2 ">
          <p className="text-sm text-gray-600 font-mono break-all">
            Wallet Address: {walletAddress}
          </p>
        </div>

        <div className="flex gap-1 items-center text-sm text-gray-600 font-mono">
          <h1>Connected</h1>
          <span className="bg-green-500 w-2 h-2 rounded-full"></span>
        </div>

        <div className="flex gap-1 items-center text-sm text-gray-600 font-mono">
          <h1>Balance</h1>
          <span>{balance} ETH</span>
        </div>

        <div className="flex gap-1 items-center text-sm text-gray-600 font-mono">
          <h1>Owner Address</h1>
          <span>{ownerAdd}</span>
        </div>

        <div className="flex gap-2 items-center">
          <Button onClick={mintToken} disabled={loading}>
            {loading && <Spinner />}Mint Token
          </Button>
          <Button onClick={transferToken} disabled={loading}>
            {loading && <Spinner />}Transfer Token
          </Button>
        </div>

        {txHistory?.message === "No transactions found" && (
          <Alert className="mb-6">
            <InfoIcon />
            <AlertTitle>{txHistory.message}</AlertTitle>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6">
            <InfoIcon />
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}

        {/* {txHistory && txHistory?.result && txHistory.result.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold mb-4">Transactions</h2>
            {txHistory.result.map((tx, index) => (
              <div
                key={tx.hash || index}
                className="border rounded-lg p-4 bg-white shadow-sm"
              >
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">From</p>
                    <p className="text-sm font-mono break-all">{tx.from}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">To</p>
                    <p className="text-sm font-mono break-all">{tx.to}</p>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Value</p>
                      <p className="text-sm font-medium">
                        {formatEther(tx.value)} ETH
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Gas</p>
                      <p className="text-sm font-medium">{tx.gas}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )} */}
      </div>
    </div>
  );
}
