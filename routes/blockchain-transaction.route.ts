const express = require('express');
const router = express.Router();

import transactionController from '../controllers/blockchainTransaction.controller';

router.get('/:tx_id', transactionController.getTransactionById);
router.get('/:wallet_address', transactionController.getTransactionByWallet);

export default router;
