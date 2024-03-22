import { Limit, LimitUpdateBody, Limits, UserId } from '../types';
import {
  getRampToken,
  getRampUserId,
  handleError,
  validateResponse,
} from '../utils';

export class LimitsService {
  static async findAll(): Promise<Limit[]> {
    try {
      const token = await getRampToken();

      const limitsEndpoint = `${process.env.RAMP_API_URL}/limits`;

      const response = await fetch(limitsEndpoint, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      validateResponse(response, 'An error occurred while getting limits');

      const limits = (await response.json()) as Limits;
      const data = limits.data;

      return data;
    } catch (error) {
      handleError(error, 'An error occurred while getting limits');
    }
  }

  static async getLimitsByUserId(userId: UserId): Promise<Limit[]> {
    try {
      const [rampUserId, token] = await Promise.all([
        getRampUserId(userId),
        getRampToken(),
      ]);

      const limitsEndpoint = `${process.env.RAMP_API_URL}/limits?user_id=${rampUserId}`;

      const response = await fetch(limitsEndpoint, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      validateResponse(
        response,
        `An error occurred while getting limits for user ${userId}`
      );

      const limits = (await response.json()) as Limits;
      const data = limits.data;

      let totalBalance = 0;
      let totalLimit = 0;

      for (const limit of data) {
        totalLimit += limit.restrictions.limit.amount;
        totalBalance += limit.balance.total.amount;
      }

      const realBalance = totalLimit - totalBalance;

      console.log({ totalBalance, totalLimit, 'real balance': realBalance });

      return data;
    } catch (error) {
      handleError(error, 'An error occurred while getting limits by user id');
    }
  }

  static async getLimitsByRampUserId(rampUserId: string): Promise<Limit[]> {
    try {
      const token = await getRampToken();

      const limitsEndpoint = `${process.env.RAMP_API_URL}/limits?user_id=${rampUserId}`;

      const response = await fetch(limitsEndpoint, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      validateResponse(
        response,
        `An error occurred while getting limits for ramp user ${rampUserId}`
      );

      const limits = (await response.json()) as Limits;
      const data = limits.data;

      return data;
    } catch (error) {
      handleError(
        error,
        'An error occurred while getting limits by ramp user id'
      );
    }
  }

  static async getLimitById(limitId: string): Promise<Limit> {
    try {
      const token = await getRampToken();

      const limitsEndpoint = `${process.env.RAMP_API_URL}/limits/${limitId}`;

      const response = await fetch(limitsEndpoint, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      validateResponse(
        response,
        `An error occurred while getting limit by id: ${limitId}`
      );

      const limit = (await response.json()) as Limit;

      return limit;
    } catch (error) {
      handleError(error, 'An error occurred while getting limit by id');
    }
  }

  static async updateLimit(
    spend_limit_id: string,
    body: LimitUpdateBody
  ): Promise<Limit> {
    try {
      const token = await getRampToken();

      const limitsEndpoint = `${process.env.RAMP_API_URL}/limits/${spend_limit_id}`;

      const response = await fetch(limitsEndpoint, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      validateResponse(
        response,
        `An error occurred while updating limit: ${spend_limit_id}`
      );

      const limit = (await response.json()) as Limit;

      return limit;
    } catch (error) {
      handleError(error, 'An error occurred while updating limit');
    }
  }

  static async updateUserSpendLimits(
    rampUserId: string,
    totalBalanceInUSD: number
  ): Promise<Limit> {
    try {
      const limits = await this.getLimitsByRampUserId(rampUserId);

      const limitsLength = limits.length;

      if (limitsLength === 0) {
        throw new Error('No limits found for this user');
      }

      // update only first limit for now
      // TODO: update all limits
      const limit = limits[0];
      const newLimit: LimitUpdateBody = {
        spending_restrictions: {
          limit: {
            amount: totalBalanceInUSD * 100, // Convert to cents
            currency_code: 'USD',
          },
          interval: 'TOTAL',
        },
      };

      const limitUpdated = await this.updateLimit(limit.id, newLimit);

      return limitUpdated;
    } catch (error) {
      handleError(error, 'An error occurred while updating user spend limits');
    }
  }
}
