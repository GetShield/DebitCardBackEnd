require('dotenv').config();
const axios = require('axios');
import logger from 'node-color-log';
import { CHAIN_MAP, TOKEN_MAP, TAGET_WALLET_ADDRESS } from '../config';
import BalanceController from '../controllers/balance.controller';
import WalletController from '../controllers/wallet.controller';
import TxHashController from '../controllers/txHash.controller';

const REQUEST_INTERVAL = 20000;

export const fetchBitcoinEvents = async function (blockchain: string) {
  let targetWallet: string = '';
  let networkName: string = '';
  let urlRequest: string = '';

  if (blockchain === 'bitcoin') {
    networkName = 'Bitcoin';
    targetWallet = TAGET_WALLET_ADDRESS.btc;
    urlRequest = `https://blockstream.info/api/address/${targetWallet}/txs`;
  } else if (blockchain === 'testnet') {
    networkName = 'Testnet';
    targetWallet = TAGET_WALLET_ADDRESS.testnet;
    urlRequest = `https://blockstream.info/testnet/api/address/${targetWallet}/txs`;
  }

  let processedTransactions = new Map();
  let transactions = (await TxHashController.getByBlockchainInside(
    blockchain
  )) as any[];
  for (const tx of transactions) {
    processedTransactions.set(tx?.txHash, true);
  }

  logger.info(
    `${networkName} Tracker Started | Target Wallet: ${targetWallet}`
  );

  setInterval(async () => {
    try {
      const response = await axios.get(urlRequest);
      const transactions = response.data;
      if (transactions.length > 0) {
        transactions.forEach(async (tx: any) => {
          try {
            if (!processedTransactions.has(tx.txid)) {
              processedTransactions.set(tx.txid, true);

              let balanceData = {
                blockchain: blockchain,
                walletAddress: tx.from,
                to: tx.to,
                crypto: 'BTC',
                txHash: tx.txid,
                amount: 0,
              };

              // process origin wallets for the transaction (may have many). at least one must be registered
              // Define the promise
              let originPromise = new Promise<String>(
                async (resolve, reject) => {
                  for (const input of tx.vin) {
                    try {
                      let wallets =
                        await WalletController.getWalletByAddressInside(
                          input.prevout.scriptpubkey_address
                        );
                      if (wallets) {
                        logger.info(`[${networkName}] Wallet of origin found!`);
                        resolve(wallets.address); // Resolve with the first found address
                      } else {
                        logger.warn(
                          `[${networkName}] One of the wallets of origin is not registered!`
                        );
                      }
                    } catch (error) {
                      logger.error(
                        `[${networkName}] Error identifying origin wallet: ` +
                          (error instanceof Error
                            ? error.message
                            : 'Unexpected error')
                      );
                      reject(false); // Reject the promise on error
                    }
                  }
                  // If loop completes without finding a wallet, reject the promise
                  reject(false);
                }
              );

              originPromise
                .then(async (originWallet: String) => {
                  try {
                    for (const output of tx.vout) {
                      if (output.scriptpubkey_address === targetWallet) {
                        balanceData.walletAddress = originWallet;
                        balanceData.amount = output.value / 1e8;
                        balanceData.to = output.scriptpubkey_address;

                        logger.info(
                          `[${networkName}] ${networkName} Transaction Identified: ${tx.txid}`
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
                          let newAmount =
                            currentAmount.valueOf() + balanceData.amount;
                          balanceData['amount'] = newAmount;

                          logger.info(
                            `[${networkName}] New Amount: ${newAmount} ${balanceData.crypto}`
                          );
                          await BalanceController.updateInside(balanceData);
                          logger.info('Balance Updated');
                        }
                      }
                    }
                  } catch (error) {
                    if (error instanceof Error) {
                      logger.error(error.message);
                    } else {
                      logger.error(
                        'Unexpected error fetching transaction data'
                      );
                    }
                  }
                })
                .catch(() => {
                  logger.warn(
                    `[${networkName}] None wallet of origin registered!`
                  );
                });

              // serialize hash on database so it wont be processed again
              let txHash: any = await TxHashController.create(
                blockchain,
                tx.txid
              );
              logger.info(
                `[${networkName}] Transaction Hash Inserted in DATABASE: ${txHash?.txHash}`
              );
            }
          } catch (error) {
            if (error instanceof Error) {
              logger.error(error.message);
            } else {
              logger.error(
                `[${networkName}] Unexpected error parsing transactions`
              );
            }
          }
        });
      } else {
        console.log('No new transactions found.');
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(error.message);
      } else {
        logger.error(`[${networkName}] Unexpected error fetching transactions`);
      }
    }
  }, REQUEST_INTERVAL); // Check for new transactions every 5 seconds
};
