import { Request, Response } from 'express';

const Wallet = require('../models/wallet.model');
const config = require('../config');

const { validate } = require('bitcoin-address-validation');
const TronWeb = require('tronweb');
const { ethers } = require('ethers');

const CoinMarketCap = require('coinmarketcap-api');
const client = new CoinMarketCap(config.CMC_API_KEY);


const UserController = {
  async getWalletByAddress (req: Request, res: Response) {
    if (req.params.address === undefined) {
      res.status(400).send({ message: 'Wallet address is empty!' });
      return;
    }

    try {
      const wallet = await Wallet.findOne({ address: req.params.address });

      res.send({ wallet });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send({ message: err.message });
      }
    }
  },

  async createWallet (req: Request, res: Response) {
    if (
      req.body === undefined ||
      req.body.address === undefined ||
      req.body.chain_type === undefined
    ) {
      res
        .status(400)
        .send({ message: 'Wallet address or Chain Type can not be empty!' });
      return;
    }
    if (
      req.body.chain_type === config.CHAIN_TYPE.BTC &&
      !validate(req.body.address)
    ) {
      res.status(400).send({ message: 'Bitcoin address is not valid address!' });
      return;
    }
    if (
      req.body.chain_type === config.CHAIN_TYPE.ETH &&
      !ethers.isAddress(req.body.address)
    ) {
      res.status(400).send({ message: 'Ethereum address is not valid address!' });
      return;
    }
    if (req.body.chain_type === config.CHAIN_TYPE.TRON) {
      const tronWeb = new TronWeb({
        fullHost: 'https://api.trongrid.io',
      });
      if (!tronWeb.isAddress(req.body.address)) {
        res.status(400).send({ message: 'Tron address is not valid address!' });
        return;
      }
    }

    const wallet = new Wallet({
      address: req.body.address,
      chain_type: req.body.chain_type,
      token_type: req.body.token_type,
      balance: '0',
    });

    try {
      await wallet.save();

      const result = await Wallet.findOne({ address: wallet.address });

      res.send({ wallet: result });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send({ message: err.message });
      }
    }
  },

  async updateBalanceByAddress (req: Request, res: Response) {
    if (
      req.params.address === undefined ||
      req.body === undefined ||
      !req.body.balance
    ) {
      res
        .status(400)
        .send({ message: 'Wallet address or balance can not be empty!' });
      return;
    }

    try {
      const wallet = await Wallet.findOneAndUpdate(
        { address: req.params.address },
        { balance: req.body.balance }
      );

      const result = await Wallet.findOne({ address: wallet.address });

      res.send({ wallet: result });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send({ message: err.message });
      }
    }
  },

  async getTokenPrice (req: Request, res: Response) {
    try {
      const quotes = await client.getQuotes({ symbol: config.TOKENS });

      const priceArr = config.TOKENS.map((tokenName: string, index: number) => {
        const price = quotes.data[tokenName].quote.USD.price;
        return { name: tokenName, price: price };
      });
      res.send({ data: priceArr });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send({ message: err.message });
      }
    }
  }
};

export default UserController;
