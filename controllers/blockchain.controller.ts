import { Request, Response } from 'express';

import Blockchain from '../models/blockchain.model';

const blockchainController = {

  async getAll (req: Request, res: Response) {
    
    try {
      const blockchains = await Blockchain.find();

      res.send({ blockchains });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send({ message: err.message });
      }
    }
  }

};

export default blockchainController;