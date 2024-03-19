import { Request, Response } from 'express';

import User from '../models/user.model';
import { handleHttpError } from '../utils';

const UserController = {
  async allUsers(req: Request, res: Response) {
    try {
      const users = await User.find();
      res.send({ users });
    } catch (err) {
      handleHttpError(err, res);
    }
  },

  async getUserById(req: Request, res: Response) {
    if (req.params.id === undefined) {
      handleHttpError(new Error('User id can not be empty!'), res, 400);
      return;
    }

    try {
      const user = await User.findById(req.params.id);
      res.send({ user });
    } catch (err) {
      handleHttpError(err, res);
    }
  },

  async createUser(req: Request, res: Response) {
    if (
      req.body === undefined ||
      req.body.user_name === undefined ||
      !req.body.user_name
    ) {
      handleHttpError(new Error('User name can not be empty!'), res, 400);
      return;
    }

    const user = new User({
      user_name: req.body.user_name,
      email: req.body.email,
      password: req.body.password,
      btc_wallet: req.body.btc_wallet,
      ether_wallet: req.body.ether_wallet,
      tron_wallet: req.body.tron_wallet,
    });

    try {
      await user.save();

      const users = await User.find();

      res.send({ users });
    } catch (err) {
      handleHttpError(err, res);
    }
  },

  async updateUserById(req: Request, res: Response) {
    if (req.params.id === undefined || req.body == undefined) {
      handleHttpError(
        new Error('User id and content can not be empty!'),
        res,
        400
      );
      return;
    }

    try {
      const user = await User.findByIdAndUpdate(req.params.id, req.body);

      res.send({ user });
    } catch (err) {
      handleHttpError(err, res);
    }
  },
};

export default UserController;
