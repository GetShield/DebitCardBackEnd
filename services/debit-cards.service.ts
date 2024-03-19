import logger from 'node-color-log';

import { baseDebitCards } from '..';
import {
  AirtableCard,
  NewAirtableUser,
  RampCard,
  RampCardsResponse,
} from '../types';
import { RAMP_API_URL } from '../config';
import {
  getRampToken,
  getRampUserId,
  handleError,
  validateResponse,
} from '../utils';
import { ObjectId } from 'mongoose';

export class DebitCardService {
  static async create(data: NewAirtableUser): Promise<string> {
    try {
      logger.info({ data });

      await baseDebitCards.create(data);

      return `User ${data.userId} created successfully in Airtable`;
    } catch (error) {
      handleError(
        error,
        `An error occurred while creating the user ${data.userId} in Airtable`
      );
    }
  }

  static async find(userId: string): Promise<AirtableCard[]> {
    try {
      const records = await baseDebitCards
        .select({
          filterByFormula: `{userId} = "${userId}"`,
        })
        .firstPage();

      const debitCards = records
        .map((record: any) => {
          let fields = record.fields;
          let cards: AirtableCard[] = [];

          for (let key in fields) {
            if (key.startsWith('card')) {
              cards.push(JSON.parse(fields[key]));
            }
          }

          return cards;
        })
        .flat();

      return debitCards as AirtableCard[];
    } catch (error) {
      handleError(
        error,
        `An error occurred while getting debit cards for user ${userId}`
      );
    }
  }

  static async findFromRamp(userId: ObjectId): Promise<RampCard[]> {
    try {
      const rampUserId = await getRampUserId(userId);
      const token = await getRampToken();

      const cardsEndpoint = `${RAMP_API_URL}/cards?user_id=${rampUserId}`;

      const response = await fetch(cardsEndpoint, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      validateResponse(
        response,
        `An error occurred while getting debit cards from Ramp for user ${userId}`
      );

      const cards = (await response.json()) as RampCardsResponse;

      return cards.data;
    } catch (error) {
      handleError(
        error,
        `An error occurred while getting debit cards from Ramp for user ${userId}`
      );
    }
  }
}
