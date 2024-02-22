import { Request, Response } from "express";
import BalanceModel from "../models/balance.model";
import BlockchainModel from "../models/blockchain.model";
import WalletModel from "../models/wallet.model";

const BalanceController = {
  async getAll(req: Request, res: Response) {
    try {
      const balances = await BalanceModel.find()
        .populate("wallet")
        .populate("blockchain");

      res.send({ balances });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send({ message: err.message });
      }
    }
  },

  async insertBalance(
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

      return await BalanceModel.create(balanceData);
    } catch (error) {
      return error;
    }
  },

  async create(req: Request, res: Response) {
    try {
      const blockchain = req.body.blockchain;
      const walletAddress = req.body.walletAddress;
      const amount = req.body.amount;
      const crypto = req.body.crypto;
      if (!blockchain || !walletAddress) {
        res.status(400).send({ message: "Wallet or Blockchain not set!" });
        return;
      }

      if (!amount) {
        res.status(400).send({ message: "Amount not set!" });
        return;
      }

      if (!crypto) {
        res.status(400).send({ message: "Crypto not set!" });
        return;
      }

      const blockchains = await BlockchainModel.find({ name: blockchain });
      const wallets = await WalletModel.find({ address: walletAddress });
      await BalanceController.insertBalance(
        req.body.amount,
        crypto,
        blockchains[0]._id,
        wallets[0]._id
      );

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

  async getByWalletAndBlockchain(req: Request, res: Response) {
    try {
      const blockchain = req.body.blockchain;
      const walletAddress = req.body.walletAddress;
      if (!blockchain || !walletAddress) {
        res.status(400).send({ message: "Wallet or Blockchain not set!" });
        return;
      }

      const blockchains = await BlockchainModel.find({ name: blockchain });
      const wallets = await WalletModel.find({ address: walletAddress });
      if (blockchains.length === 0 || wallets.length === 0) {
        res.status(404).send({ message: "Wallet or Blockchain not found!" });
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
        res.status(400).send({ message: "User not set!" });
        return;
      }

      // Find wallets for the user
      const wallets = await WalletModel.find({ user: userId });

      // Extract wallet ids
      const walletIds = wallets.map((wallet) => wallet._id);

      // Find balances for the wallets
      const balances = await BalanceModel.find({ wallet: { $in: walletIds } })
        .populate("wallet")
        .populate("blockchain");

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
        res.status(400).send({ message: "User not set!" });
        return;
      }

      // Find wallets for the user
      const wallets = await WalletModel.find({ user: userId });

      // Extract wallet ids
      const walletIds = wallets.map((wallet) => wallet._id);

      // Find balances for the wallets
      const balances = await BalanceModel.find({ wallet: { $in: walletIds } })
        .populate("wallet")
        .populate("blockchain");

      res.send({ balances });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send({ message: err.message });
      }
    }
  },
};

export default BalanceController;
