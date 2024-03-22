const TronWeb = require('tronweb'); //there is no types for tronweb
import { ethers } from 'ethers';
import { Response } from 'express';
import { validate } from 'bitcoin-address-validation';
import logger from 'node-color-log';
import { CHAIN_TYPE, CRYPT_API_KEY } from '../config';
import {
  RAMP_CLIENT_ID,
  RAMP_SECRET_ID,
  RAMP_API_URL,
  TOKENS,
  CMC_API_KEY,
} from '../config';
import { baseDebitCards } from '..';
import {
  Balance,
  CryptoDeduction,
  ExchangeRate,
  Price,
  UserId,
} from '../types';

const https = require('https');

const CoinMarketCap = require('coinmarketcap-api');
import ccxt from 'ccxt';

export async function getRampToken() {
  try {
    const endpoint = `${RAMP_API_URL}/token`;

    const clientId = RAMP_CLIENT_ID;
    const clientSecret = RAMP_SECRET_ID;

    const headers = {
      Accept: 'application/json',
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const requestBody = {
      grant_type: 'client_credentials',
      scope: 'cards:read transactions:read limits:read limits:write',
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: new URLSearchParams(requestBody),
    });

    validateResponse(response, 'An error occurred while fetching ramp token');

    const tokenRes: any = await response.json();
    return tokenRes.access_token;
  } catch (error) {
    handleError(error, 'An error occurred while getting ramp token');
  }
}

export async function getRampUserId(userId: UserId): Promise<string> {
  try {
    const records = await baseDebitCards
      .select({
        filterByFormula: `{userId} = "${userId}"`,
      })
      .firstPage();

    const rampUserId = records.map(
      (record: any) => record.fields.rampUserId
    )[0];

    return rampUserId;
  } catch (error) {
    throw new Error('An error occurred while getting ramp user id');
  }
}

export function calculateTotalBalance({
  balances,
  prices,
}: {
  balances: Balance[];
  prices: Price[];
}) {
  return balances?.reduce((acc, balance) => {
    const { price = 0 } =
      prices.find((price) => price.name === balance.currency) || {};
    return acc + balance.amount * price;
  }, 0);
}

export async function validateWalletAddress(
  address: String,
  type: String
): Promise<boolean | Error> {
  try {
    if (!address) {
      throw new Error('Wallet address is empty!');
    }
    if (!type) {
      throw new Error('Blockchain type is empty!');
    }

    if (
      type !== CHAIN_TYPE.BTC &&
      type !== CHAIN_TYPE.ETH &&
      type !== CHAIN_TYPE.TRON
    ) {
      throw new Error('Blockchain type is not valid!');
    }

    if (type === CHAIN_TYPE.BTC && !validate(address as string)) {
      throw new Error('Bitcoin address is not valid address!');
    }

    if (type === CHAIN_TYPE.ETH && !ethers.isAddress(address)) {
      throw new Error('Ethereum address is not valid address!');
    }
    if (type === CHAIN_TYPE.TRON) {
      const tronWeb = new TronWeb({
        fullHost: 'https://api.trongrid.io',
      });
      if (!tronWeb.isAddress(address)) {
        throw new Error('Tron address is not valid address!');
      }
    }
    return true;
  } catch (error: Error | any) {
    if (error instanceof Error) {
      console.log('error', error.message);
      return error;
    } else {
      return new Error('An error occurred while validating the wallet address');
    }
  }
}

export async function getExchangeRate(ticker: string): Promise<ExchangeRate> {
  try {
    const rates = await getAllExchangeRates();
    const rate = rates.find((rate) => rate.name === ticker);

    if (!rate) {
      throw new Error(`Exchange rate for ${ticker} not found`);
    }

    return rate;
  } catch (err) {
    handleError(err, 'An error occurred while executing getExchangeRate');
  }
}

export async function getAllExchangeRates(): Promise<ExchangeRate[]> {
  const client = new CoinMarketCap(CMC_API_KEY);
  try {
    const quotes = await client.getQuotes({ symbol: TOKENS });

    const priceArr = TOKENS.map((tokenName: string, index: number) => {
      const price = quotes.data[tokenName].quote.USD.price;
      return { name: tokenName, price: price };
    });

    return priceArr;
  } catch (err) {
    handleError(err, 'An error occurred while executing getAllExchangeRates');
  }
}

export function handleError(error: any, defaultMessage: string): never {
  let message = defaultMessage;
  if (error instanceof Error) {
    message = error.message;
  }
  console.error(error);
  throw new Error(message);
}

export function handleHttpError(
  error: unknown,
  res: Response,
  statusCode: number = 500
): void {
  if (error instanceof Error) {
    res.status(statusCode).send({ error: error.message });
  } else {
    res.status(statusCode).send({ error: 'An error occurred' });
  }
  console.error(error);
}

export function validateResponse(response: any, message: string) {
  if (!response.ok) {
    throw new Error(`${message}: ${response.status} - ${response.statusText}`);
  }
}

export async function getHistoricPrice(ticker: string, dateStr: string) {
  try {
    if (TOKENS.indexOf(ticker) === -1) {
      throw new Error(
        `Invalid ticker! The ticker must be one of the following: ${TOKENS.join(
          ', '
        )}`
      );
    }

    let exchange = new ccxt.binance();
    let timestamp = new Date(dateStr).getTime();
    let data = await exchange.fetchOHLCV(`${ticker}/USDT`, '1m', timestamp, 1);

    return data[0][1];
  } catch (err) {
    throw err;
  }
}

export function getTransactionById(txId: string) {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'GET',
      hostname: 'rest.cryptoapis.io',
      path: `/v2/blockchain-data/bitcoin/testnet/transactions/${txId}`,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': CRYPT_API_KEY,
      },
    };

    var req = https.request(options, (res: any) => {
      let chunks: any = [];

      res.on('data', (chunk: any) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        let data = Buffer.concat(chunks);
        try {
          let result = JSON.parse(data.toString());
          resolve(result); // Resolve the promise with the result
        } catch (e) {
          reject(e); // Reject the promise if an error occurs
        }
      });
    });

    req.on('error', (e: Error) => {
      reject(e); // Reject the promise if an error occurs during the request
    });

    req.end();
  });
}
