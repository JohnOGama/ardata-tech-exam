import { BrowserProvider } from "ethers";
import { ethers } from "ethers"


interface WalletConnectI {
    error: string | null;
    address: string | null;
    balance: string | null;
    provider: BrowserProvider | null
}

export const useConnectWallet = () => {

    async function connectWallet(): Promise<WalletConnectI> {

        if(!window.ethereum) {
            return {
                address: null,
                balance: null,
                provider: null,
                error: "Metamask not installed",
            }
        }

        await window.ethereum.request({
            method: "eth_requestAccounts"
        })

        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()

        const address = await signer.getAddress()
        const balance = await provider.getBalance(address)

        return {
            address,
            balance: ethers.formatEther(balance),
            provider,
            error: null,
        }
    }

    return {
        connectWallet
    }
}
