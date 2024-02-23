import { ethers } from 'ethers';
import logger from 'node-color-log';
import ABI from '../abis/ERC20Abi.json';
import { CHAIN_MAP, TOKEN_MAP, TAGET_WALLET_ADDRESS } from '../config';
import BalanceController from '../controllers/balance.controller';

export const fetchEvmEvents = async function (blockchain: string) {
  let webSocketUrl: string = '';
  let targetWallet: string = '';
  let networkName: string = '';
  let provider: ethers.WebSocketProvider;
  let trackingTokens: any[] = [];

  try {
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

    logger.info(
      `${networkName} Tracker Started | Target Wallet: ${targetWallet}`
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
              txHash: tx.hash, // TODO added later, test it
            };

            logger.info(`${networkName} Transaction Identified: ${tx.hash}`);
            logger.info(balanceData);
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

              logger.info(`New Amount: ${newAmount}`);
              await BalanceController.updateInside(balanceData);
            }
          }
        } catch (error) {
          logger.info(error);
        }
      }
    });

    logger.info(`Tracked Tokens: `);

    trackingTokens.forEach((token, index) => {
      try {
        const name = token.name;
        const address = token.address;
        const decimals = token.decimals;
        logger.info(`${name} | address: ${address}`);
        const contract = new ethers.Contract(address, ABI, provider);

        contract.on('Transfer', async (from, to, value, event) => {
          if (to.toLowerCase() == targetWallet) {
            let transferEvent = {
              name: name,
              from: from,
              to: to,
              value: ethers.formatUnits(value, decimals),
            };

            logger.info(transferEvent);
          }
        });
      } catch (error) {
        if (error instanceof Error) {
          logger.error(error.message);
        } else {
          logger.error('Unexpected error parsing token data');
        }
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error('Unexpected error requesting blockchain data');
    }
  }
};
