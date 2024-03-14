import { Request, Response } from 'express';

import { LimitsService } from '../services';

const LimitsController = {
  async allLimits(req: Request, res: Response) {
    try {
      const limits = await LimitsService.findAll();
      if (limits.result === 'error') {
        return res.status(500).send({ error: limits.error });
      }
      res.send(limits.data);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return res.status(500).send({ error: error.message });
      }
    }
  },

  async getByCurrentUser(req: Request, res: Response) {
    const userId = req.body.user.id;
    if (!userId) {
      res.status(400).send({ message: 'User id can not be empty!' });
      return;
    }

    try {
      const limits = await LimitsService.getLimitsByUserId(userId);
      if (limits.result === 'error') {
        return res.status(500).send({ error: limits.error });
      }
      res.send(limits.data);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return res.status(500).send({ error: error.message });
      }
    }
  },

  async getLimitById(req: Request, res: Response) {
    const { limitId } = req.params;
    if (!limitId) {
      res.status(400).send({ message: 'Limit id can not be empty!' });
      return;
    }

    try {
      const limit = await LimitsService.getLimitById(limitId);
      if (limit.result === 'error') {
        return res.status(500).send({ error: limit.error });
      }
      res.send(limit.data);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return res.status(500).send({ error: error.message });
      }
    }
  },

  async updateLimit(req: Request, res: Response) {
    const { limitId } = req.params;
    if (!limitId) {
      res.status(400).send({ message: 'Limit id can not be empty!' });
      return;
    }

    const { body } = req;
    if (!body) {
      res.status(400).send({ message: 'Request body can not be empty!' });
      return;
    }

    const { user, ...rest } = body;

    try {
      const limit = await LimitsService.updateLimit(limitId, rest);
      if (limit.result === 'error') {
        return res.status(500).send({ error: limit.error });
      }
      res.send(limit.data);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return res.status(500).send({ error: error.message });
      }
    }
  },
};

export default LimitsController;
