import express from 'express';
const router = express.Router();

import webhookController from '../controllers/webhook.controller';
import logRequest from '../middlewares/logRequest';

router.post('/', logRequest, webhookController.processWebhook);

export default router;
