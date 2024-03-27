import { Request, Response } from 'express';

import Blockchain from '../models/blockchain.model';
import { handleHttpError } from '../utils';

const blockchainController = {
  async getAll(req: Request, res: Response) {
    try {
      const blockchains = await Blockchain.find();

      res.send({ blockchains });
    } catch (err) {
      handleHttpError(err, res);
    }
  },
};

export default blockchainController;
