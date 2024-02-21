import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Wallet from '../models/wallet.model';
import Blockchain from '../models/blockchain.model';
import config from '../config';

import { validate } from 'bitcoin-address-validation';
const TronWeb = require('tronweb');
import { ethers } from 'ethers';

const CoinMarketCap = require('coinmarketcap-api');
const client = new CoinMarketCap(config.CMC_API_KEY);


const WalletController = {

  async getAll (req: Request, res: Response) {
   

    try {
      const wallet = await Wallet.find();

      res.send({ wallet });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send({ message: err.message });
      }
    }
  },

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

  async getWalletByBlockchain (req: Request, res: Response) {
    if (req.params.blockchain === undefined) {
      res.status(400).send({ message: 'Blockchain is empty!' });
      return;
    }

    try {
      const blockchain = await Blockchain.findOne({ name: req.params.blockchain }).populate('wallets');
      if (blockchain === null) {
        res.status(404).send({ message: 'Blockchain not found!' });
        return;
      }

      res.send({ wallets: blockchain.wallets });
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


  async create (req: Request, res: Response) {
    if (
      req.body.address === undefined ||
      req.body.user === undefined ||
      req.body.blockchains === undefined ||
      req.body.blockchains.length === 0
    ) {
      res
        .status(400)
        .send({ message: 'Wallet address or Chain Type can not be empty!' });
      return;
    }


    // Start a session for the transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    const address = req.body?.address;

    try {
      // get blockchain ids
      let blockchainIds = [];
      for (let blockchainName of req.body.blockchains) {
        const blockchain = await Blockchain.findOne({ name: blockchainName }).exec();
        if (blockchain) {
          blockchainIds.push(blockchain._id);
        }
      }

      // Create the new wallet
      const wallet = new Wallet(req.body);
      wallet.blockchains = blockchainIds;
      await wallet.save({ session });

      // Add the new wallet to each associated blockchain
      await Blockchain.updateMany(
        { _id: { $in: blockchainIds } },
        { $push: { wallets: wallet._id } },
        { session }
      );

      // Commit the transaction
      await session.commitTransaction();

    } catch (error) {
      // If an error occurred, abort the transaction
      await session.abortTransaction();
      
      if (error instanceof Error) {
        res.status(500).send({ message: error.message });
      } else {
        res.status(500).send({ message: 'An error occurred while creating the wallet' });
      }
    } finally {
      // End the session
      session.endSession();

      // Find the new wallet
      const result = await Wallet.findOne({ address: address });
      res.send({ wallet: result });
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

      if (wallet) {
        const result = await Wallet.findOne({ address: wallet.address });
        res.send({ wallet: result });
      } else {
        res.status(404).send({ message: 'Wallet not found' });
      }
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

export default WalletController;
