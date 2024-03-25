import logger from 'node-color-log';

import userModel from '../models/user.model';
import { TransactionsService } from './transactions.service';

const minutes = 5; // Update as needed

const everyTime = minutes * 60 * 1000;
const everyTimeInMinutes = everyTime / 1000 / 60;

export function startUpdateService() {
  updateAllUsers(); // Update all users immediately

  setInterval(updateAllUsers, everyTime); // Update every everyTime
}

async function updateAllUsers() {
  console.log(
    'Updating all users now and every',
    everyTimeInMinutes,
    'minutes.'
  );
  try {
    const users = await userModel.find();
    for (const user of users) {
      try {
        const res = await TransactionsService.syncTransactions(user.id);
        logger.info('Updated user:', user.id, res);
      } catch (error) {
        console.error('Failed to update user:', user.id, error);
      }
    }
  } catch (error) {
    console.error('Failed to update all users:', error);
  }
}
