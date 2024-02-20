import { ethers } from 'ethers'

import ABI from '../abis/ERC20Abi.json'
import { CHAIN_MAP, TOKEN_MAP, TAGET_WALLET_ADDRESS } from '../config'

export const fetchSepoliaEvents = async function () {
    const provider = new ethers.WebSocketProvider(CHAIN_MAP.sepolia.websocket_url);

    provider.on("block", async (blockNumber) => {
        const block = await provider.getBlock(blockNumber, true);
        
        for (const tx of block!.prefetchedTransactions) {
            if (tx.value > 0 && tx.to!.toLowerCase() === TAGET_WALLET_ADDRESS.sepolia.toLowerCase()) {
                let transferEvent = {
                    name: "ETH",
                    from: tx.from,
                    to: tx.to,
                    value: ethers.formatEther(tx.value)
                }

                console.log(transferEvent);
            }
        }
    })

    TOKEN_MAP.sepolia.forEach((token, index) => {
        const name = token.name;
        const address = token.address;
        const decimals = token.decimals;
        console.log(name)
        console.log(address)
        const contract = new ethers.Contract(address, ABI, provider);

        contract.on("Transfer", async (from, to, value, event) => {
            if (to.toLowerCase() == TAGET_WALLET_ADDRESS.sepolia.toLowerCase()) {
                let transferEvent = {
                    name: name,
                    from: from,
                    to: to,
                    value: ethers.formatUnits(value, decimals)
                }

                console.log(transferEvent)
            }
        })
    })
}