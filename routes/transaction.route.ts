const express = require('express');
const router = express.Router();

const transactionController = require('../controllers/transaction.controller');

router.get('/:tx_id', transactionController.getTransactionById);
router.get('/:wallet_address', transactionController.getTransactionByWallet);

module.exports = router;
