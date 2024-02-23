import authorize from '../middlewares/authorize';
import express from 'express';
const router = express.Router();

import blockchainController from '../controllers/blockchain.controller';
import logRequest from '../middlewares/logRequest';
router.get('/', authorize, logRequest, blockchainController.getAll);

export default router;
