import { Request, Response } from 'express';

import { LimitsService } from '../services';
import { handleHttpError } from '../utils';

const LimitsController = {
  async allLimits(req: Request, res: Response) {
    try {
      const limits = await LimitsService.findAll();
      res.send(limits);
    } catch (error) {
      handleHttpError(error, res);
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
      res.send(limits);
    } catch (error) {
      handleHttpError(error, res);
    }
  },

  async getLimitById(req: Request, res: Response) {
    const { limitId } = req.params;
    if (!limitId) {
      handleHttpError(new Error('Limit id can not be empty!'), res, 400);
      return;
    }

    try {
      const limit = await LimitsService.getLimitById(limitId);
      res.send(limit);
    } catch (error) {
      handleHttpError(error, res);
    }
  },

  async updateLimit(req: Request, res: Response) {
    const { limitId } = req.params;
    if (!limitId) {
      handleHttpError(new Error('Limit id can not be empty!'), res, 400);
      return;
    }

    const { body } = req;
    if (!body) {
      handleHttpError(new Error('Request body can not be empty!'), res, 400);
      return;
    }

    const { user, ...rest } = body;

    try {
      const limit = await LimitsService.updateLimit(limitId, rest);
      res.send(limit);
    } catch (error) {
      handleHttpError(error, res);
    }
  },
};

export default LimitsController;
