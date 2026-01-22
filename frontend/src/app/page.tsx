'use client'

import { Alert,  AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useConnectWallet } from "@/hooks/useConnectWallet";
import { etherScanAPI, EtherscanResponse } from "@/service/ether-scan";
import { InfoIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { formatEther } from "ethers";

const API_KEY = process.env.NEXT_PUBLIC_ETHERS_API_KEY!

export default function Home() {
  const [error, setError] = useState<string>("")
  const [balance, setBalance] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [txHistory, setTxHistory] = useState<EtherscanResponse>()
  const [loading, setLoading] = useState<boolean>(false)
  const [mounted, setMounted] = useState<boolean>(false)
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false)

  const { connectWallet } = useConnectWallet()

  useEffect(() => {
    setMounted(true)
  }, [])

  const walletConnect = async () => {
    try {
      setLoading(true)

      const {address, balance, error } = await connectWallet()
      
      if(error !== null) {
        setError(error)
      }

      if(!address || !balance) {
        setError("Something went wrong")
        return
      }

      setWalletAddress(address)
      setBalance(balance)
      
      const response = await etherScanAPI({address, apiKey: API_KEY })
      setTxHistory(response)

      setIsWalletConnected(true)
    } catch (error) {
      console.error('error wallet connect', error)
      setIsWalletConnected(false)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="h-screen w-full flex justify-center items-center">
        <Button disabled>Loading...</Button>
      </div>
    )
  }

  if(!isWalletConnected) {
    return (
      <div className="h-screen w-full flex justify-center items-center">
        <Button disabled={loading} onClick={walletConnect}>{loading && <Spinner/>}Connect Metamask</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full p-4 lg:max-w-[800px] lg:mx-auto">
      <div className="py-8 space-y-3">
        <div className="flex items-center gap-2 ">
          <p className="text-sm text-gray-600 font-mono break-all">Wallet Address: {walletAddress}</p>
        </div>

        <div className="flex gap-1 items-center text-sm text-gray-600 font-mono">
          <h1>Connected</h1>
          <span className="bg-green-500 w-2 h-2 rounded-full"></span>
        </div>

        <div className="flex gap-1 items-center text-sm text-gray-600 font-mono">
          <h1>Balance</h1>
          <span>{balance} ETH</span>
        </div>



        {txHistory?.message === "No transactions found" && (
          <Alert className="mb-6">
            <InfoIcon/>
            <AlertTitle>{txHistory.message}</AlertTitle>
          </Alert>
        )}

        {error && 
          <Alert className="mb-6">
            <InfoIcon/>
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        }

        {txHistory && txHistory?.result && txHistory.result.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold mb-4">Transactions</h2>
            {txHistory.result.map((tx, index) => (
              <div key={tx.hash || index} className="border rounded-lg p-4 bg-white shadow-sm">
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
                      <p className="text-sm font-medium">{formatEther(tx.value)} ETH</p>
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
        )}
      </div>
    </div>
  );
}
