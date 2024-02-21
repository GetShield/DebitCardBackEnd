import authorize from '../middlewares/authorize';
import express from 'express';
const router = express.Router();

import blockchainController from '../controllers/blockchain.controller';

router.get('/', authorize, blockchainController.getAll);

export default router;
