import userModel from '../models/user.model';
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
