const express = require('express');
const router = express.Router();

const transactionController = require('../controllers/blockchainTransaction.controller');

router.get('/:tx_id', transactionController.getTransactionById);
router.get('/:wallet_address', transactionController.getTransactionByWallet);

export default router;
