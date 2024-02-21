import authorize from '../middlewares/authorize';

import express from 'express';
const router = express.Router();

import transactionsController from '../controllers/transactions.controller';

router.get('/', authorize, transactionsController.findTransactions);

export default router;
