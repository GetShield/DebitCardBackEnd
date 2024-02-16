import { Application } from 'express';

const userRoutes = require('./user.route');
const walletRoutes = require('./wallet.route');
const authRoutes = require('./auth.route');

exports.init = function (app: Application) {
  app.use('/api/users', userRoutes);
  app.use('/api/wallets', walletRoutes);
  app.use('/api/auth', authRoutes);
};
