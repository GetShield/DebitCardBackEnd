import authorize from '../middlewares/authorize';
import logRequest from '../middlewares/logRequest';

import express from 'express';
const router = express.Router();

import transactionsController from '../controllers/transactions.controller';

router.get('/', authorize, logRequest, transactionsController.findTransactions);

export default router;
