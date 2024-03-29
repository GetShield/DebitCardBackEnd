import logger from 'node-color-log';

import userModel from '../models/user.model';
import { TransactionsService } from './transactions.service';
import { SHIELD_USERID } from '../config';
import { LimitsService } from './limits.service';
import { getRampUserId } from '../utils';

const minutes = 5; // Update as needed

const everyTime = minutes * 60 * 1000;
const everyTimeInMinutes = everyTime / 1000 / 60;

export function startUpdateService() {
  updateAllUsers(); // Update all users immediately

  setInterval(updateAllUsers, everyTime); // Update every everyTime
}

async function updateAllUsers() {
  logger.info(
    'Updating all users now and every',
    everyTimeInMinutes,
    'minutes.'
  );
  try {
    const users = await userModel.find();
    for (const user of users) {
      try {
        const userId = user._id;
        if (userId.toString() === SHIELD_USERID) {
          continue;
        }

        const rampUserId = await getRampUserId(userId);

        if (!rampUserId) {
          logger.fontColorLog('red', `User ${userId} does not have a ramp id.`);
          continue;
        }

        const res = await TransactionsService.syncTransactions(user.id);
        logger.fontColorLog(
          'blue',
          `Synced user ${user.id} with ${res.numberOfTransactions} new transactions.`
        );

        await LimitsService.syncUserSpendLimits(user.id);
        logger.fontColorLog('blue', `Synced user ${user.id} spend limits.`);
      } catch (error) {
        logger.fontColorLog(
          'red',
          `Failed to sync user ${user.id} transactions`
        );
      }
    }
  } catch (error) {
    logger.bgColorLog('red', 'Failed to sync all users transactions:');
  }
}
