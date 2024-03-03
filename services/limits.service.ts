import { Limit, LimitUpdateBody, Limits, Result } from '../types';
import { getRampToken, getRampUserId } from '../utils';

export class LimitsService {
  static async findAll(): Promise<Result<Limit[], unknown>> {
    try {
      const token = await getRampToken();

      const limitsEndpoint = `${process.env.RAMP_API_URL}/limits`;

      const response = await fetch(limitsEndpoint, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const limits = (await response.json()) as Limits;
      const data = limits.data;

      return { result: 'success', data };
    } catch (error) {
      console.error(error);
      return { result: 'error', error };
    }
  }

  static async getLimitsByUserId(
    userId: string
  ): Promise<Result<Limit[], unknown>> {
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

      return { result: 'success', data };
    } catch (error) {
      console.error(error);
      return { result: 'error', error };
    }
  }

  static async getLimitsByRampUserId(
    rampUserId: string
  ): Promise<Result<Limit[], unknown>> {
    try {
      const token = await getRampToken();

      const limitsEndpoint = `${process.env.RAMP_API_URL}/limits?user_id=${rampUserId}`;

      const response = await fetch(limitsEndpoint, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const limits = (await response.json()) as Limits;
      const data = limits.data;

      return { result: 'success', data };
    } catch (error) {
      console.error(error);
      return { result: 'error', error };
    }
  }

  static async getLimitById(limitId: string): Promise<Result<Limit, unknown>> {
    try {
      const token = await getRampToken();

      const limitsEndpoint = `${process.env.RAMP_API_URL}/limits/${limitId}`;

      const response = await fetch(limitsEndpoint, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const limit = (await response.json()) as Limit;

      return { result: 'success', data: limit };
    } catch (error) {
      console.error(error);
      return { result: 'error', error };
    }
  }

  static async updateLimit(
    spend_limit_id: string,
    body: LimitUpdateBody
  ): Promise<Result<Limit, unknown>> {
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

      if (!response.ok) {
        throw new Error(`Failed to update spend_limit_id: ${spend_limit_id}`);
      }

      const limit = (await response.json()) as Limit;

      return { result: 'success', data: limit };
    } catch (error) {
      return { result: 'error', error };
    }
  }

  static async updateUserSpendLimits(
    rampUserId: string,
    totalBalanceInUSD: number
  ): Promise<Result<Limit, unknown>> {
    try {
      const res = await this.getLimitsByRampUserId(rampUserId);

      if (res.result === 'error') {
        return { result: 'error', error: res.error };
      }

      const { data: limits } = res;

      const limitsLength = limits.length;

      if (limitsLength === 0) {
        return { result: 'error', error: 'No limits found for user' };
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

      const res2 = await this.updateLimit(limit.id, newLimit);
      if (res2.result === 'error') {
        return { result: 'error', error: res2.error };
      }

      return { result: 'success', data: res2.data };
    } catch (error) {
      console.error(error);
      return { result: 'error', error };
    }
  }
}
