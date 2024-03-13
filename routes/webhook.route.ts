import express from 'express';
import validate from '../middlewares/validateTx';
import webhookController from '../controllers/webhook.controller';
import logRequest from '../middlewares/logRequest';

const router = express.Router();
router.post('/notify', logRequest, validate, webhookController.processWebhook);

export default router;
