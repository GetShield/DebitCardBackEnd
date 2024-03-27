import express from 'express';

import logRequest from '../middlewares/logRequest';
import TxOrphanedController from '../controllers/txOrphaned.controller';
import authorize from '../middlewares/authorize';

const router = express.Router();

router.get('/', logRequest, authorize, TxOrphanedController.getTxOrphaned);
router.put('/reassign', logRequest, authorize, TxOrphanedController.reassignTx);

export default router;
