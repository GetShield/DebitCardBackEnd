import express from 'express';
const router = express.Router();

import transactionController from '../controllers/blockchainTransaction.controller';
import authorize  from '../middlewares/authorize';

router.get('/:tx_id', authorize, transactionController.getTransactionById);
router.get('/:wallet_address', authorize, transactionController.getTransactionByWallet);

export default router;
