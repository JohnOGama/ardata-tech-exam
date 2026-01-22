interface Params {
    apiKey: string;
    chainId?: string;
    module?: string;
    action?: string;
    address: string;
    startBlock?: number;
    endBlock?: number;
    page?: number;
    pageSize?: number;
    offset?: number;
    sort?: "desc" | "asc"
}

export interface EtherscanTransaction {
    blockNumber: string;
    blockHash: string;
    timeStamp: string;
    hash: string;
    nonce: string;
    transactionIndex: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasPrice: string;
    input: string;
    methodId: string;
    functionName: string;
    contractAddress: string;
    cumulativeGasUsed: string;
    txreceipt_status: string;
    gasUsed: string;
    confirmations: string;
    isError: string;
}

export interface EtherscanResponse {
    status: string;
    message: string;
    result: EtherscanTransaction[];
}

export const etherScanAPI = async (params: Params): Promise<EtherscanResponse> => {
    const baseUrl = 'https://api.etherscan.io/v2/api'
    const searchParams = new URLSearchParams({
        module: params.module || "account",
        action: params.action || "txlist",
        address: params.address,
        startblock: String(params.startBlock || 0),
        endblock: String(params.endBlock || 100),
        page: String(params.page || 1),
        offset: String(params.offset || 10),
        sort: params.sort || "desc",
        apikey: params.apiKey,
        chainId: String(params.chainId || 1),
    })

    const url = `${baseUrl}?${searchParams.toString()}`

    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: EtherscanResponse = await response.json()
    
    return data
}