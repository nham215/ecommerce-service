import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AwsService {
  async getAccessToken(key: string): Promise<string> {
    console.log('get access');
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

  async getOrder() {
    try {
      //   this.access = await this.getAccessToken(process.env.AWS_KEY_FUSION);
      const orders = await axios.get(
        'https://sellingpartnerapi-eu.amazon.com/orders/v0/orders?MarketplaceIds=A1F83G8C2ARO7P&CreatedAfter=2023-10-10&MaxResultPerPage=1000000',
        {
          headers: {
            Accept: 'application/json',
            'x-amz-access-token': `Atza|IwEBII9Bpf7ncNJPVtW3tYG_oeAThp5S4tCEaPp8D9h1fvjpbbQIApkv_IKX2hU0SH1FM9sr6PsPY1cbbFpoVLjhGwYAZBmaEtOUo6l0L_pN9rvPyTUpdQUb1kbKn6RvfUN-VgJlUvuoDrJwgLYVbaux5VA2VBEaFfsu7aL5L-SGXd9A1z9gqJxeExj994c4uzpILVbYZrhggriRVDoFhUMp5eD2TkHA1wSUEKvVl6r2KE8tNTnFzCslHV6hKZFL_Zddm6rmSrRILn3cn_Em4-mWhU7R02bf26300PsBEq4bYxn_9U3_cpSvalCvYzzzTrObBb-yFbGmhPUx1EXveeQ7T0r6Dt3h4LpstV26mA76fwb68w`,
          },
        },
      );
      return orders.data;
    } catch (error) {
      console.error('Error syncing sale:', error);
      return { success: false, error: 'Failed to get orders' };
    }
  }

  async inventoryFBA() {
    const result = await axios.get(
      'https://sellingpartnerapi-na.amazon.com/fba/inventory/v1/summaries?details=true&granularityType=Marketplace&granularityId=ATVPDKIKX0DER&marketplaceIds=ATVPDKIKX0DER',
    );
  }
}
