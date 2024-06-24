import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as moment from 'moment-timezone';

@Injectable()
export class AwsService {
  private endpoint: string;
  private marketplaceId: string;

  constructor() {
    this.endpoint = process.env.AWS_ENDPOINT;
    this.marketplaceId = process.env.AWS_MARKETPLACE_ID;
  }

  async getAccessToken(key: string): Promise<string> {
    const accessToken = axios.post(
      'https://api.amazon.com/auth/o2/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: key,
        client_id: process.env.AWS_CLIENT_ID,
        client_secret: process.env.AWS_CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    return (await accessToken).data.access_token;
  }

  async syncOrders() {
    //   this.access = await this.getAccessToken(process.env.AWS_KEY_FUSION);
    return this.getOrders()

  }

  async getOrders() {
    let nextToken = null;
    let allOrders = [];
    const yesterday = moment.tz('Europe/London').subtract(1, 'days').format('YYYY-MM-DD');

    do {
      try {
        const response = await axios.get(
          `${this.endpoint}/orders/v0/orders`,
          {
            params: {
              MarketplaceIds: this.marketplaceId,
              CreatedAfter: yesterday,
              ...(nextToken && { NextToken: nextToken })
            },
            headers: {
              Accept: 'application/json',
              'x-amz-access-token': `Atza|IwEBIMsphn57gIdWxPiyDAs4vPscAj8KvOcpdZwJqRERbA_3_9xn_aO-K-nNnB91gfq5DxortMYXCqnxL_YDo6gu2CzjFaj2IgoXYHYIRfjC5O0h50r0DoK_e_0lUkaZG8JKvP0_EOcXZRHpBEIMyQUHmswcT8j1Y8dhOVhlj2eji-YkLoJeDuhAmVa1GiGEbbCMqosVp-ShoxrEvq9KRTVDizaanq8gtYos1KeAdtF0-YmuPg-Gz7c7s-ew68kAkGkz5SuAqtLMgjZt66Wtau0yxz0kGzzcW7Ma4yyAiVNnEI36EOLALDm1LcjhAAtTtvXZm7b8zIykLqWGIP-9QejJEotiyW_B1RY5PKXG9ATSfklJpA`,
            },
          },
        );

        const orders = response.data.payload.Orders || [];
        allOrders = allOrders.concat(orders);
        nextToken = response.data.NextToken || null;
      } catch (error) {
        console.error('Error syncing sale:', error);
        return { success: false, error: 'Failed to get orders' };
      }
    } while (nextToken);

    return allOrders;
  }

  async inventoryFBA() {
    const result = await axios.get(
      `${this.endpoint}/fba/inventory/v1/summaries?details=true&granularityType=Marketplace&granularityId=${this.marketplaceId}&marketplaceIds=${this.marketplaceId}`,
    );
  }
}
