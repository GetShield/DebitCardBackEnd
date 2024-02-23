import { Request, Response } from 'express';
import BalanceModel from '../models/balance.model';
import BlockchainModel from '../models/blockchain.model';
import WalletModel from '../models/wallet.model';
import { Document } from 'mongoose';

const BalanceController = {
  async getAll(req: Request, res: Response) {
    // ...

    try {
      const balances = await BalanceModel.find()
        .populate('wallet')
        .populate('blockchain');

      res.send({ balances });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send({ message: err.message });
      }
    }
  },

  async updateBalance(
    amount: number,
    crypto: string,
    blockchainId: string,
    walletId: string
  ) {
    try {
      const balanceData = {
        date: new Date(),
        amount: amount,
        crypto: crypto,
        blockchain: blockchainId,
        wallet: walletId,
      };

      await BalanceModel.findOneAndUpdate(
        { crypto, blockchain: blockchainId, wallet: walletId },
        { amount: amount },
        { upsert: true }
      );
    } catch (error) {
      return error;
    }
  },

  async updateInside(data: any) {
    try {
      const blockchains = await BlockchainModel.find({ name: data.blockchain });
      const wallets = await WalletModel.find({ address: data.walletAddress });
      await BalanceController.updateBalance(
        data.amount,
        data.crypto,
        blockchains[0]._id,
        wallets[0]._id
      );

      let balances = await BalanceModel.find({
        blockchain: blockchains[0]._id,
        wallet: wallets[0]._id,
      });
      return balances;
    } catch (error) {
      return error;
    }
  },

  async update(req: Request, res: Response) {
    try {
      const blockchain = req.body.blockchain;
      const walletAddress = req.body.walletAddress;
      const amount = req.body.amount;
      const crypto = req.body.crypto;
      const txHash = req.body.txHash;
      if (!blockchain || !walletAddress) {
        res.status(400).send({ message: 'Wallet or Blockchain not set!' });
        return;
      }

      if (!amount) {
        res.status(400).send({ message: 'Amount not set!' });
        return;
      }

      if (!crypto) {
        res.status(400).send({ message: 'Crypto not set!' });
        return;
      }

      if (!txHash) {
        res.status(400).send({ message: 'Transaction hash not set!' });
        return;
      }

      let balances = await BalanceController.updateInside(req.body);

      res.send({ balances });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send({ message: err.message });
      }
    }
  },

  async getAmountByCryptoWalletAndBlockchainInside(
    balanceData: any
  ): Promise<Number | Error> {
    try {
      const blockchains = await BlockchainModel.find({
        name: balanceData.blockchain,
      });
      const wallets = await WalletModel.find({
        address: balanceData.walletAddress,
      });
      if (blockchains.length === 0 || wallets.length === 0) {
        new Error('Wallet or Blockchain not found!');
      }
      if (!balanceData.crypto) {
        new Error('Crypto not set!');
      }

      let balances = await BalanceModel.find({
        blockchain: blockchains[0]._id,
        wallet: wallets[0]._id,
        crypto: balanceData.crypto,
      });
      if (balances.length === 0) {
        return 0;
      } else {
        return balances[0].amount;
      }
    } catch (err) {
      if (err instanceof Error) {
        return new Error(err.message);
      }
      return new Error('An error occurred.');
    }
  },

  async getByWalletAndBlockchain(req: Request, res: Response) {
    try {
      const blockchain = req.body.blockchain;
      const walletAddress = req.body.walletAddress;
      if (!blockchain || !walletAddress) {
        res.status(400).send({ message: 'Wallet or Blockchain not set!' });
        return;
      }

      const blockchains = await BlockchainModel.find({ name: blockchain });
      const wallets = await WalletModel.find({ address: walletAddress });
      if (blockchains.length === 0 || wallets.length === 0) {
        res.status(404).send({ message: 'Wallet or Blockchain not found!' });
        return;
      }

      let balances = await BalanceModel.find({
        blockchain: blockchains[0]._id,
        wallet: wallets[0]._id,
      });

      res.send({ balances });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send({ message: err.message });
      }
    }
  },

  async getByUser(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      if (!userId) {
        res.status(400).send({ message: 'User not set!' });
        return;
      }

      // Find wallets for the user
      const wallets = await WalletModel.find({ user: userId });

      // Extract wallet ids
      const walletIds = wallets.map((wallet) => wallet._id);

      // Find balances for the wallets
      const balances = await BalanceModel.find({ wallet: { $in: walletIds } })
        .populate('wallet')
        .populate('blockchain');

      res.send({ balances });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send({ message: err.message });
      }
    }
  },

  async getByCurrentUser(req: Request, res: Response) {
    try {
      const userId = req.body.user?.id;
      if (!userId) {
        res.status(400).send({ message: 'User not set!' });
        return;
      }

      // Find wallets for the user
      const wallets = await WalletModel.find({ user: userId });

      // Extract wallet ids
      const walletIds = wallets.map((wallet) => wallet._id);

      // Find balances for the wallets
      const balances = await BalanceModel.find({ wallet: { $in: walletIds } })
        .populate('wallet')
        .populate('blockchain');

      res.send({ balances });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send({ message: err.message });
      }
    }
  },
};

export default BalanceController;
