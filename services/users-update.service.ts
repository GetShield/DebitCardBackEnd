import userModel from '../models/user.model';
import { LimitUpdateBody } from '../types';
import { getRampUserId } from '../utils';
import { BalanceService } from './balance.service';
import { LimitsService } from './limits.service';
import { WalletService } from './wallet.service';

const everyTime = 5 * 60 * 1000; // 5 minutes
const everyTimeInMinutes = everyTime / 1000 / 60;

export function startUpdateService() {
  updateAllUsers(); // Update all users immediately

  setInterval(updateAllUsers, everyTime); // Update every everyTime
}

// This function updates all users
async function updateAllUsers() {
  console.log(
    'Updating all users now and every',
    everyTimeInMinutes,
    'minutes.'
  );
  try {
    // 1. Fetch all users
    const users = await userModel.find();
    // 2. Fetch prices
    const prices = await WalletService.getPrices();
    // 3. Update each user
    for (const user of users) {
      // rampUserId comes from the user Airtable row
      const rampUserId = await getRampUserId(user.id);
      if (!rampUserId) {
        console.error(`User ${user.id} does not have a Ramp user ID`);
        continue;
      }
      // 3.a. Fetch the user's balance in Crypto
      // 3.b. Calculate the user's balance in USD w/ the prices
      const totalBalanceInUSD = await BalanceService.getTotalBalanceInUSD(
        user.id,
        prices
      );
      // 4. Update the Ramp limits for each user
      const res = await LimitsService.updateUserSpendLimits(
        rampUserId,
        totalBalanceInUSD
      );
      if ('error' in res) {
        console.error(`Failed to update user ${user.id}:`, res.error);
        continue;
      } else {
        console.log(
          `User ${user.id} was successfully updated with ${totalBalanceInUSD} USD limit.`
        );
      }
    }
  } catch (error) {
    console.error('Failed to update all users:', error);
  }
}

// 1. Fetch all users.
// 2. Fetch prices.
// 3. For each user,
//   3.a. fetch the user's balance in Crypto
//   3.b  calculate the user's balance in USD w/ the prices.
// 4. Update the Ramp limits for each user (needs the rampUserId).
//   4.a. THE PROBLEM IS TO DECREASE THE AMOUNT WHEN THERE ARE EXPENSES BECAUSE OF THE PRICES DISCREPANCY OF THE CRYPTO.
// 5. Update the crypto balance of the user.

// We can store the transactions of the ramp API in a Transactions collection in our DB.
// The documents there would have the whole ramp Structure, and the user id.
// So when we do the sync, we fetch the ramp API transactions of the user, and then we filter the ones that are already in our DB.
// And then we process the new ones, and update the user's balance in our DB and store the new transactions in our DB.

// Idea:
// When we do the update, we fetch the transactions from ramp API and we also fetch the transactions from mongoDB.
// Then we filter the transactions that are not in the DB and we process them.
// Const? the time of the update will be the time of the crypto valuation.
// To be exactly we should be able to get the proce of every time of the day, and then we should be able to get the price of the crypto at the time of the transaction.
