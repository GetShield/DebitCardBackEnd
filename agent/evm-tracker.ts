import { ethers } from 'ethers';
import logger from 'node-color-log';
import ABI from '../abis/ERC20Abi.json';
import { CHAIN_MAP, TOKEN_MAP, TAGET_WALLET_ADDRESS } from '../config';
import BalanceController from '../controllers/balance.controller';
import TxHashController from '../controllers/txHash.controller';

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

    let processedTransactions = new Map();
    let transactions = (await TxHashController.getByBlockchainInside(
      blockchain
    )) as any[];
    for (const tx of transactions) {
      processedTransactions.set(tx?.txHash, true);
    }

    logger.info(
      `[${networkName}] Tracker Started | Target Wallet: ${targetWallet}`
    );
    provider = new ethers.WebSocketProvider(webSocketUrl);
    provider.on('block', async (blockNumber) => {
      const block = await provider.getBlock(blockNumber, true);

      for (const tx of block!.prefetchedTransactions) {
        if (!processedTransactions.has(tx.hash)) {
          processedTransactions.set(tx.hash, true);
          try {
            if (tx.value > 0 && tx.to?.toLowerCase() === targetWallet) {
              let balanceData = {
                blockchain: blockchain,
                walletAddress: tx.from,
                to: tx.to,
                amount: Number(ethers.formatEther(tx.value)),
                crypto: 'ETH',
                txHash: tx.hash,
              };

              logger.info(
                `[${networkName}] ${networkName} Transaction Identified: ${tx.hash}`
              );
              logger.info(`[${networkName}]`, balanceData);
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

                logger.info(
                  `[${networkName}] New Amount: ${newAmount} ${balanceData.crypto}`
                );
                await BalanceController.updateInside(balanceData);
                logger.info('Balance Updated');
              }
              // serialize hash on database so it wont be processed again
              let txHash: any = await TxHashController.create(
                blockchain,
                tx.hash
              );
              logger.info(
                `[${networkName}] Transaction Hash Inserted in DATABASE: ${txHash?.txHash}`
              );
            }
          } catch (error) {
            logger.info(error);
          }
        }
      }
    });

    logger.info(`[${networkName}] Tracked Tokens: `);

    trackingTokens.forEach((token, index) => {
      try {
        const name = token.name;
        const address = token.address;
        const decimals = token.decimals;
        logger.info(`[${networkName}] ${name} | address: ${address}`);
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
