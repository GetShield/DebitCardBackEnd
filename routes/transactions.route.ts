import authorize from '../middlewares/authorize';

const express = require('express');
const router = express.Router();

import transactionsController from '../controllers/transactions.controller';

router.get('/', authorize, transactionsController.findTransactions);

export default router;
