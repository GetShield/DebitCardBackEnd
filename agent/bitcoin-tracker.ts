require('dotenv').config();
const axios = require('axios');
import logger from 'node-color-log';
import { CHAIN_MAP, TOKEN_MAP, TAGET_WALLET_ADDRESS } from '../config';
import BalanceController from '../controllers/balance.controller';

const REQUEST_INTERVAL = 5000;
const REQUEST_THRESHOLD = 120000;

export const fetchBitcoinEvents = async function (blockchain: string) {
  let targetWallet: string = '';
  let networkName: string = '';
  let requestConfig = {
    'Content-Type': 'application/json',
  };

  if (blockchain === 'bitcoin') {
    networkName = 'Bitcoin';
    targetWallet = TAGET_WALLET_ADDRESS.btc;
  } else if (blockchain === 'testnet') {
    networkName = 'Testnet';
    targetWallet = TAGET_WALLET_ADDRESS.testnet;
  }

  let processedTransactions = new Map();
  // TODO fullfill processedTransactions with data from database

  logger.info(
    `${networkName} Tracker Started | Target Wallet: ${targetWallet}`
  );

  setInterval(async () => {
    try {
      const urlRequest = `https://api.blockcypher.com/v1/btc/main/addrs/${targetWallet}/full`;
      const response = await axios.get(urlRequest, requestConfig);
      const transactions = response.data.txs;
      let countTransactions = 0;
      for (const tx of transactions) {
        if (!processedTransactions.has(tx.hash)) {
          processedTransactions.set(tx.hash, true);

          logger.info('processed Transactions So Far:', countTransactions);

          let balanceData = {
            blockchain: blockchain,
            walletAddress: targetWallet,
            to: tx.outputs[0].addresses[0],
            amount: Number(tx.outputs[0].value / 1e8),
            crypto: 'BTC',
            txHash: tx.hash,
          };

          logger.info(`${networkName} Transaction Identified: ${tx.hash}`);
          logger.info(balanceData);

          // get current balance and update
          let currentAmount =
            await BalanceController.getAmountByCryptoWalletAndBlockchainInside(
              balanceData
            );
          if (currentAmount instanceof Error) {
            throw currentAmount;
          } else {
            let newAmount = currentAmount.valueOf() + balanceData.amount;
            balanceData['amount'] = newAmount;

            logger.info(`New Amount: ${newAmount} ${balanceData.crypto}`);
            await BalanceController.updateInside(balanceData);
          }

          // TODO serialize processed transactions on database

          countTransactions++;
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(error.message);
      } else {
        logger.error('Unexpected error fetching transactions');
      }
    }
  }, REQUEST_INTERVAL); // Check for new transactions every 5 seconds
};
