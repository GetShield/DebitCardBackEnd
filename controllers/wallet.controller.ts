import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Wallet from '../models/wallet.model';
import Blockchain from '../models/blockchain.model';
import User from '../models/user.model';
import config from '../config';
import validate from 'bitcoin-address-validation';
import { validateWalletAddress } from '../utils';

const CoinMarketCap = require('coinmarketcap-api');
const client = new CoinMarketCap(config.CMC_API_KEY);

const WalletController = {
  async shield(req: Request, res: Response) {
    const userId = process.env.SHIELD_USERID;
    if (userId === undefined) {
      res.status(400).send({ message: 'User is empty!' });
      return;
    }

    try {
      const wallet = await Wallet.find({ user: userId }).populate(
        'blockchains'
      );
      if (wallet === null) {
        res.status(404).send({ message: 'No wallet found for this user!' });
        return;
      }

      res.send({ wallet });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send({ message: err.message });
      }
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const wallet = await Wallet.find()
        .populate('user')
        .populate('blockchains');

      res.send({ wallet });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send({ message: err.message });
      }
    }
  },

  async getWalletByAddress(req: Request, res: Response) {
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

  async getWalletByBlockchain(req: Request, res: Response) {
    if (req.params.blockchain === undefined) {
      res.status(400).send({ message: 'Blockchain is empty!' });
      return;
    }

    try {
      const blockchain = await Blockchain.findOne({
        name: req.params.blockchain,
      }).populate('wallets');
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

  async getWalletByUser(req: Request, res: Response) {
    if (req.params.userId === undefined) {
      res.status(400).send({ message: 'User is empty!' });
      return;
    }

    try {
      const wallet = await Wallet.find({ user: req.params.userId }).populate(
        'blockchains'
      );
      if (wallet === null) {
        res.status(404).send({ message: 'No wallet found for this user!' });
        return;
      }

      res.send({ wallet });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send({ message: err.message });
      }
    }
  },

  async getWalletByCurrentUser(req: Request, res: Response) {
    if (req.body.user === undefined) {
      res.status(400).send({ message: 'User is empty!' });
      return;
    }

    try {
      const wallet = await Wallet.find({ user: req.body.user.id }).populate(
        'blockchains'
      );
      if (wallet === null) {
        res.status(404).send({ message: 'No wallet found for this user!' });
        return;
      }

      res.send({ wallet });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send({ message: err.message });
      }
    }
  },

  async updateWallet(req: Request, res: Response) {
    try {
      if (req.body.blockchain === undefined) {
        res.status(400).send({ message: 'Blockchain can not be empty!' });
        return;
      }

      if (
        req.body.oldAddress === undefined ||
        req.body.newAddress === undefined
      ) {
        res
          .status(400)
          .send({ message: 'Old Address and New Address can not be empty!' });
        return;
      }

      if (req.body.user === undefined) {
        res.status(400).send({ message: 'User can not be empty!' });
        return;
      }

      // get blockchain Id
      const blockchain = await Blockchain.findOne({
        name: req.body.blockchain,
      });
      if (blockchain === null) {
        res.status(404).send({ message: 'Blockchain not found!' });
        return;
      }

      let result = await Wallet.findOneAndUpdate(
        { user: req.body.user.id, address: req.body.oldAddress },
        { $set: { address: req.body.newAddress } }
      );

      if (result) {
        res.send({ wallet: result });
      } else {
        res.status(404).send({ message: 'Wallet not found' });
      }
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send({ message: err.message });
      } else {
        res
          .status(500)
          .send({ message: 'An error occurred while updating the wallet' });
      }
    }
  },

  async create(req: Request, res: Response) {
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
      let chainType: String = '';
      for (let blockchainName of req.body.blockchains) {
        const blockchain = await Blockchain.findOne({
          name: blockchainName,
        }).exec();
        if (blockchain) {
          if (chainType && chainType !== blockchain.chainType) {
            res.status(400).send({
              message:
                'Wallet can not be created with multiple blockchain types!',
            });
            return;
          }
          chainType = blockchain.chainType;
          blockchainIds.push(blockchain._id);
        }
      }

      // validate wallet address
      const isValid = await validateWalletAddress(address, chainType);
      if (isValid !== true) {
        res.status(400).send({
          message: `Address ${address} considered not valid for blockchain type ${chainType}`,
        });
        return;
      }

      // Create the new wallet
      const wallet = new Wallet(req.body);
      wallet.blockchains = blockchainIds;

      //if not passed a specific user id it will create for the logged user
      wallet.user = req.body.userId || req.body.user.id;
      wallet.date = new Date();
      await wallet.save({ session });

      // Add the new wallet to each associated blockchain
      await Blockchain.updateMany(
        { _id: { $in: blockchainIds } },
        { $push: { wallets: wallet._id } },
        { session }
      );

      // Add the new wallet to the user
      await User.updateMany(
        { _id: { $in: wallet.user } },
        { $push: { wallets: wallet._id } },
        { session }
      );

      // Commit the transaction
      await session.commitTransaction();

      // End the session
      session.endSession();

      // Find the new wallet
      const result = await Wallet.findOne({ address: address });
      res.send({ wallet: result });
    } catch (error) {
      // If an error occurred, abort the transaction
      await session.abortTransaction();

      if (error instanceof Error) {
        res.status(500).send({ message: error.message });
      } else {
        res
          .status(500)
          .send({ message: 'An error occurred while creating the wallet' });
      }
    }
  },

  async updateBalanceByAddress(req: Request, res: Response) {
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

  async getTokenPrice(req: Request, res: Response) {
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
  },
};

export default WalletController;
