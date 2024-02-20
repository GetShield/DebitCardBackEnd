import { baseDebitCards } from '..';
import { Result, Transaction } from '../types';

export class TransactionsService {
  static async find(userId: string): Promise<Result<any, unknown>> {
    try {
      const endpoint = `${process.env.RAMP_API_URL}/token`;

      const clientId = process.env.RAMP_CLIENT_ID;
      const clientSecret = process.env.RAMP_SECRET_ID;

      const headers = {
        Accept: 'application/json',
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      const requestBody = {
        grant_type: 'client_credentials',
        scope: 'cards:read transactions:read',
      };

      async function performRequest() {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: headers,
          body: new URLSearchParams(requestBody),
        });
        return response.json();
      }

      const tokenRes: any = await performRequest();
      const token = tokenRes.access_token;

      // Transactions
      const records = await baseDebitCards
        .select({
          filterByFormula: `{userId} = "${userId}"`,
        })
        .firstPage();

      const rampUserId = records.map(
        (record: any) => record.fields.rampUserId
      )[0];

      const transactionsEndpoint = `${process.env.RAMP_API_URL}/transactions?user_id=${rampUserId}`;

      const response = await fetch(transactionsEndpoint, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      const transactions = data;

      return { result: 'success', data: transactions };
    } catch (error) {
      console.error(error);
      return { result: 'error', error };
    }
  }
}
