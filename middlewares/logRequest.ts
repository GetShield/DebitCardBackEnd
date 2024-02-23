import { Request, Response, NextFunction } from 'express';
const logger = require('node-color-log');

function logRequest(req: Request, res: Response, next: NextFunction) {
  try {
    logger.info(
      `${req.method} ${req.url} | ${
        req.body?.user?.id ? `logged as userId: ${req.body?.user?.id} |` : ''
      } ${
        Object.keys(req.params).length
          ? `params: ${JSON.stringify(req.params)}`
          : ''
      }`
    );
    next();
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: 'Unauthorized' });
    }
  }
}

export default logRequest;
