import { Request, Response } from 'express';
import { User } from '../types';
import { DebitCardService } from '../services/debit-cards.service';
import UserModel from '../models/user.model';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const secretKey = process.env.JWT_SECRET;

export default {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await UserModel.findOne({ email: email });

      if (!user) {
        res.status(401).send({ error: 'Invalid credentials.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        res.status(401).send({ error: 'Invalid credentials.' });
        return;
      }

      const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '3h' });

      const response = {
        _id: user._id,
        user_name: user.user_name,
        email: user.email,
        token,
      };

      res.send(response);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return res.status(500).send({ error: error.message });
      }
    }
  },

  async register(req: Request, res: Response) {
    try {
      const { email, password, user_name } = req.body;

      const alreadyExists = await UserModel.findOne({ email: email });

      if (alreadyExists) {
        res.status(409).send({ error: 'Email already taken.' });
        return;
      }

      console.log({ email, password, user_name });

      const salt = bcrypt.genSaltSync(10);
      const hashed_password = bcrypt.hashSync(password, salt);

      const newUser: User = {
        email: email,
        password: hashed_password,
        user_name: user_name,
        btc_wallet: '',
        ether_wallet: '',
        tron_wallet: '',
      };
      const user = new UserModel(newUser);
      await user.save();

      const cardRes = await DebitCardService.create({
        userId: user._id,
        rampUserId: '',
        userName: user_name,
        userEmail: email,
        card1: JSON.stringify({
          cardNumber: '',
          cardName: '',
          cardExpiry: '',
          cardCVV: '',
        }),
      });
      if (cardRes.result === 'error') {
        res.status(500).send({ error: cardRes.error });
        return;
      }

      const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });

      res.json({ _id: user._id, user_name, email, token });
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        res.status(500).send({ error: error.message });
      }
    }
  },
};
