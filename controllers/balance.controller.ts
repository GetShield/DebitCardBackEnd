import { Request, Response } from 'express';

import BalanceModel from '../models/balance.model';
import BlockchainModel from '../models/blockchain.model';
import WalletModel from '../models/wallet.model';
import TxOrphaned from '../models/txOrphaned.model';
import { TxData } from '../types/txData';
import { BalanceService } from '../services';
import { handleError, handleHttpError } from '../utils';

const BalanceController = {
  async getAll(req: Request, res: Response) {
    // ...

    try {
      const balances = await BalanceModel.find()
        .populate('wallet')
        .populate('blockchain');

      res.send({ balances });
    } catch (err) {
      handleHttpError(err, res);
    }
  },

  async updateBalance(
    amount: number,
    currency: string,
    blockchainId: string,
    walletId: string
  ) {
    try {
      await BalanceModel.findOneAndUpdate(
        { currency, blockchain: blockchainId, wallet: walletId },
        { $inc: { amount: amount } },
        { upsert: true }
      );
    } catch (error) {
      handleError(error, 'Error updating balance');
    }
  },

  async updateInside(data: TxData) {
    try {
      const blockchains = await BlockchainModel.find({ chain: data.chain });
      const wallets = await WalletModel.find({ address: data.from });

      if (!wallets.length) {
        await TxOrphaned.create(data);
        throw new Error(
          `Wallet not found and txHash ${data.txHash} saved as orphaned!`
        );
      }

      await BalanceController.updateBalance(
        data.amount,
        data.currency,
        blockchains[0]._id.toString(),
        wallets[0]._id.toString()
      );

      let balance = await BalanceModel.findOne({
        blockchain: blockchains[0]._id,
        wallet: wallets[0]._id,
      }).populate({ path: 'wallet', select: 'user' });

      if (!balance) {
        throw new Error('Balance not found');
      }

      const walletWithUser: any = balance.wallet;
      return {
        currency: balance.currency.toString(),
        userId: walletWithUser.user,
        amount: Number(balance.amount),
      };
    } catch (error) {
      handleError(error, 'Error updating balance inside');
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
      handleHttpError(err, res);
    }
  },

  async getAmountByCryptoWalletAndBlockchainInside(
    balanceData: any
  ): Promise<Number | Error> {
    try {
      const blockchains = await BlockchainModel.find(
        { name: balanceData.blockchain },
        null,
        { maxTimeMS: 50000 }
      );
      const wallets = await WalletModel.find({
        address: balanceData.walletAddress,
      });
      if (blockchains.length === 0) {
        throw new Error('Blockchain not found!');
      }

      if (wallets.length === 0) {
        throw new Error('Wallet of origin not registered!');
      }

      if (!balanceData.crypto) {
        throw new Error('Crypto not set!');
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
      handleError(err, 'Error getting amount by crypto, wallet and blockchain');
    }
  },

  async getByWalletAndBlockchain(req: Request, res: Response) {
    try {
      const blockchain = req.body.blockchain;
      const walletAddress = req.body.walletAddress;
      if (!blockchain || !walletAddress) {
        handleHttpError(new Error('Wallet or Blockchain not set!'), res, 400);
        return;
      }

      const blockchains = await BlockchainModel.find({ name: blockchain });
      const wallets = await WalletModel.find({ address: walletAddress });
      if (blockchains.length === 0 || wallets.length === 0) {
        handleHttpError(new Error('Wallet or Blockchain not found!'), res, 404);
        return;
      }

      let balances = await BalanceModel.find({
        blockchain: blockchains[0]._id,
        wallet: wallets[0]._id,
      });

      res.send({ balances });
    } catch (err) {
      handleHttpError(err, res);
    }
  },

  async getByUser(req: Request, res: Response) {
    try {
      const userId = req.params.userId as any;
      if (!userId) {
        handleHttpError(new Error('User not set!'), res, 400);
        return;
      }

      const balances = await BalanceService.getBalancesByUserId(userId);

      res.send({ balances });
    } catch (err) {
      handleHttpError(err, res);
    }
  },

  async getByCurrentUser(req: Request, res: Response) {
    try {
      const userId = req.body.user?.id;
      if (!userId) {
        handleHttpError(new Error('User not set!'), res, 400);
        return;
      }

      const balances = await BalanceService.getBalancesByUserId(userId);

      res.send({ balances });
    } catch (err) {
      handleHttpError(err, res);
    }
  },
};

export default BalanceController;
