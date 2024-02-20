import authorize from '../middlewares/authorize';

const express = require('express');
const router = express.Router();

const transactionsController = require('../controllers/transactions.controller');

router.get('/', authorize, transactionsController.findTransactions);

module.exports = router;
