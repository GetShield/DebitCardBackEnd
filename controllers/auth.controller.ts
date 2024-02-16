import { Request, Response } from 'express';
import { User } from '../types';
const UserModel = require('../models/user.model');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const secretKey = process.env.JWT_SECRET;

exports.login = async function (req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email: email });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).send({ message: 'Invalid credentials.' });
      return;
    }

    const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '1h' });

    const response = {
      email: user.email,
      token,
    };

    res.send(response);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return res.status(500).send({ message: error.message });
    }
  }
};

exports.register = async function (req: Request, res: Response) {
  try {
    const { email, password, user_name } = req.body;

    const alreadyExists = await UserModel.findOne({ email: email });

    if (alreadyExists) {
      res.status(409).send({ message: 'Email already taken.' });
      return;
    }

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

    const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });

    res.json({ user_name, email, token });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      res.status(500).send({ message: error.message });
    }
  }
};
