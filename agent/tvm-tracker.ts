require('dotenv').config();
const axios = require('axios');
import logger from 'node-color-log';
const tronWeb = require('tronweb');
import { CHAIN_MAP, TOKEN_MAP, TAGET_WALLET_ADDRESS } from '../config';
import BalanceController from '../controllers/balance.controller';

const REQUEST_INTERVAL = 5000;
const REQUEST_THRESHOLD = 120000;

export const fetchTvmEvents = async function (blockchain: string) {
  let rpcUrl: string = '';
  let targetWallet: string = '';
  let networkName: string = '';
  let trackingTokens: any[] = [];
  let requestConfig = {
    'Content-Type': 'application/json',
    'TRON-PRO-API-KEY': process.env.TRON_API_KEY || '',
  };

  if (blockchain === 'nile') {
    networkName = 'Nile';
    targetWallet = TAGET_WALLET_ADDRESS.nile;
    trackingTokens = TOKEN_MAP.sepolia;
    rpcUrl = 'https://nile.trongrid.io';
  } else if (blockchain === 'tron') {
    networkName = 'Tron';
    targetWallet = TAGET_WALLET_ADDRESS.tron;
    trackingTokens = TOKEN_MAP.tron;
    rpcUrl = 'https://api.trongrid.io';
  }

  let processedTransactions = new Map();
  logger.info(
    `[${networkName}] Tracker Started | Target Wallet: ${targetWallet}`
  );

  setInterval(async () => {
    try {
      const latestTimestamp = Date.now() - REQUEST_THRESHOLD;

      const urlRequest = `${rpcUrl}/v1/accounts/${targetWallet}/transactions?only_to=true&only_confirmed=true&min_timestamp=${latestTimestamp}`;
      const response = await axios.get(urlRequest, requestConfig);
      const transactions = response.data.data;
      let countTransactions = 0;
      for (const tx of transactions) {
        if (!processedTransactions.has(tx.txID)) {
          processedTransactions.set(tx.txID, true);
          const urlTransaction = `${rpcUrl}/wallet/gettransactionbyid`;

          const payload = {
            value: tx.txID,
            visible: true,
          };

          const txInfo = await axios.post(
            urlTransaction,
            payload,
            requestConfig
          );
          const txData = txInfo.data.raw_data.contract[0].parameter.value;

          logger.info(
            `[${networkName}]processed Transactions So Far:`,
            countTransactions
          );

          let balanceData = {
            blockchain: blockchain,
            walletAddress: txData.owner_address,
            to: txData.to_address,
            amount: Number(txData.amount / 1e6),
            crypto: 'TRX',
            txHash: tx.txID,
          };

          if (txData.hasOwnProperty('asset_name')) {
            balanceData.crypto = txData.asset_name;
          }

          logger.info(
            `[${networkName}] ${networkName} Transaction Identified: ${tx.txID}`
          );
          logger.info(`[${networkName}]`, balanceData);

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

            logger.info(
              `[${networkName}] New Amount: ${newAmount} ${balanceData.crypto}`
            );
            await BalanceController.updateInside(balanceData);
            logger.info('Balance Updated');
          }

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
