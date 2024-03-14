import { Error } from 'mongoose';
import { CHAIN_TYPE } from '../config';
import { validate } from 'bitcoin-address-validation';
const TronWeb = require('tronweb'); //there is no types for tronweb
import { ethers } from 'ethers';
import {
  RAMP_CLIENT_ID,
  RAMP_SECRET_ID,
  RAMP_API_URL,
  TOKENS,
  CMC_API_KEY,
} from '../config';
const CoinMarketCap = require('coinmarketcap-api');
import { baseDebitCards } from '..';
import { Balance, Price } from '../types';

export async function getRampToken() {
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

  const tokenRes: any = await response.json();
  return tokenRes.access_token;
}

export async function getRampUserId(userId: string): Promise<string> {
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
      prices.find((price) => price.name === balance.crypto) || {};
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
      return error;
    } else {
      return new Error('An error occurred while validating the wallet address');
    }
  }
}

export async function getExchangeRate(ticker: string) {
  const client = new CoinMarketCap(CMC_API_KEY);
  try {
    const rates = await getAllExchangeRates();
    for (const item of rates) {
      if (item.name === ticker) {
        return item;
      }
    }

    return null;
  } catch (err) {
    throw err;
  }
}

export async function getAllExchangeRates() {
  const client = new CoinMarketCap(CMC_API_KEY);
  try {
    const quotes = await client.getQuotes({ symbol: TOKENS });

    const priceArr = TOKENS.map((tokenName: string, index: number) => {
      const price = quotes.data[tokenName].quote.USD.price;
      return { name: tokenName, price: price };
    });

    return priceArr;
  } catch (err) {
    throw err;
  }
}
