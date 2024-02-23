import { ethers } from 'ethers';

import ABI from '../abis/ERC20Abi.json';
import { CHAIN_MAP, TOKEN_MAP, TAGET_WALLET_ADDRESS } from '../config';
import BalanceController from '../controllers/balance.controller';

export const fetchEvmEvents = async function (blockchain: string) {
  let webSocketUrl: string = '';
  let targetWallet: string = '';
  let networkName: string = '';
  let provider: ethers.WebSocketProvider;
  let trackingTokens: any[] = [];

  if (blockchain === 'sepolia') {
    networkName = 'Sepolia';
    targetWallet = TAGET_WALLET_ADDRESS.sepolia.toLowerCase();
    webSocketUrl = CHAIN_MAP.sepolia.websocket_url;
    trackingTokens = TOKEN_MAP.sepolia;
  } else if (blockchain === 'ethereum') {
    networkName = 'Ethereum';
    targetWallet = TAGET_WALLET_ADDRESS.eth.toLowerCase();
    webSocketUrl = CHAIN_MAP.eth.websocket_url;
    trackingTokens = TOKEN_MAP.eth;
  }

  console.log(
    `\n${networkName} Tracker Started | Target Wallet: ${targetWallet}`
  );
  provider = new ethers.WebSocketProvider(webSocketUrl);
  provider.on('block', async (blockNumber) => {
    const block = await provider.getBlock(blockNumber, true);

    for (const tx of block!.prefetchedTransactions) {
      try {
        if (tx.value > 0 && tx.to?.toLowerCase() === targetWallet) {
          let balanceData = {
            blockchain: blockchain,
            walletAddress: tx.from,
            to: tx.to,
            amount: Number(ethers.formatEther(tx.value)),
            crypto: 'ETH',
          };

          console.log(`${networkName} Transaction Identified: ${tx.hash}`);
          console.log(balanceData);
          let currentAmount =
            await BalanceController.getAmountByCryptoWalletAndBlockchainInside(
              balanceData
            );

          // get current balance and update
          if (currentAmount instanceof Error) {
            throw currentAmount;
          } else {
            let newAmount = currentAmount.valueOf() + balanceData.amount;
            balanceData['amount'] = newAmount;

            console.log(`New Amount: ${newAmount}`);
            await BalanceController.updateInside(balanceData);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  });

  console.log(`Tracked Tokens: `);

  trackingTokens.forEach((token, index) => {
    const name = token.name;
    const address = token.address;
    const decimals = token.decimals;
    console.log(`${name} | address: ${address}`);
    const contract = new ethers.Contract(address, ABI, provider);

    contract.on('Transfer', async (from, to, value, event) => {
      if (to.toLowerCase() == targetWallet) {
        let transferEvent = {
          name: name,
          from: from,
          to: to,
          value: ethers.formatUnits(value, decimals),
        };

        console.log(transferEvent);
      }
    });
  });
};