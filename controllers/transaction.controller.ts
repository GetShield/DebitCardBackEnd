import { Request, Response } from 'express';

const Transaction = require('../models/transaction.model');
const config = require('../config');

const { validate } = require('bitcoin-address-validation');
const TronWeb = require('tronweb');
const { ethers } = require('ethers');

const CoinMarketCap = require('coinmarketcap-api');
const client = new CoinMarketCap(config.CMC_API_KEY);

exports.getTransactionById = async function (req: Request, res: Response) {
  if (req.params.tx_id === undefined) {
    res.status(400).send({ message: 'Transaction hash is empty!' });
    return;
  }

  try {
    const transaction = await Transaction.findOne({ tx_id: req.params.tx_id });

    res.send({ transaction });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).send({ message: err.message });
    }
  }
};


exports.getTransactionByWallet = async function (req: Request, res: Response) {
  if (req.params.wallet_address === undefined) {
    res.status(400).send({ message: 'Wallet address is empty!' });
    return;
  }

  try {
    const transaction = await Transaction.findOne({ tx_id: req.params.tx_id });

    res.send({ transaction });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).send({ message: err.message });
    }
  }
};
