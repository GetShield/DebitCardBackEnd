import { Error } from 'mongoose';
import { CHAIN_TYPE } from '../config';
import { validate } from 'bitcoin-address-validation';
const TronWeb = require('tronweb'); //there is no types for tronweb
import { ethers } from 'ethers';
import { RAMP_CLIENT_ID, RAMP_SECRET_ID, RAMP_API_URL } from '../config';

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
    scope: 'cards:read transactions:read',
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: headers,
    body: new URLSearchParams(requestBody),
  });

  const tokenRes: any = await response.json();
  return tokenRes.access_token;
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
