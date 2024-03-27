import { Request, Response, NextFunction } from 'express';

import { JWT_SECRET } from '../config';

const jwt = require('jsonwebtoken');

function authorize(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const decode = jwt.verify(token, JWT_SECRET);
    req.body.user = decode;
    next();
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: 'Unauthorized' });
    }
  }
}

export default authorize;
