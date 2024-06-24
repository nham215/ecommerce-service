import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as moment from 'moment-timezone';
import { AwsOrder, Product } from '../model/Aws';

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
            }
        );
        return (await accessToken).data.access_token;
    }

    async syncOrders() {
        //   this.access = await this.getAccessToken(process.env.AWS_KEY_FUSION);
        const orders: AwsOrder[] = [];
        const _orders = await this.getOrders();

        await Promise.all(
            _orders.map(async (order) => {
                const orderItems = await this.getOrderItems(order.AmazonOrderId);
                const formattedOrderItems: Product[] = orderItems.map((item) => ({
                    Id: item.OrderItemId,
                    Name: item.Title,
                    Quantity: Number(item.ProductInfo?.NumberOfItems),
                    SKU: item.SellerSKU,
                }));

                orders.push({
                    Account: {
                        Email: order.BuyerInfo?.BuyerEmail,
                        Name: order.BuyerInfo?.BuyerName,
                    },
                    OrderID: order.AmazonOrderId,
                    OrderDate: order.PurchaseDate,
                    Barcode: null,
                    Product: formattedOrderItems,
                    OrderValue: order.OrderTotal?.Amount,
                    OrderStatus: order.OrderStatus,
                });
            })
        );

        return orders;
    }

    async getOrders() {
        let nextToken = null;
        let allOrders = [];
        const yesterday = moment.tz('Europe/London').subtract(2, 'days').format('YYYY-MM-DD');

        do {
            try {
                const response = await axios.get(`${this.endpoint}/orders/v0/orders`, {
                    params: {
                        MarketplaceIds: this.marketplaceId,
                        CreatedAfter: yesterday,
                        NextToken: nextToken,
                    },
                    headers: {
                        'x-amz-access-token': `Atza|IwEBIOYVNgunlM3Y-T_Bqchi6B8M8JecaU7cN06cjViOOG3hUSOvM39miYYy0Fq29pSO4PBm2FXBHsWSBeu06rnhTBdJ6NR0OOoJazrh04Q12InbirNA_VeujXoLpBoltQ_HmSGUVIu63zarak2R-OE2B82Jrhetty38aeDGz5iFrG7Xbht50gO6z-DmugsNGEZTl-FYyOCo1Z6K0nU-ea3iChpqmWBiuV_FGjiD8f4BbQR8swQk5JTvbxN4Dy5El6kOO4kuQj0xPvePsSCE5ZlW2v9kFPDwaz1cBHDuF7ymv0kIhbkrPz6SEHUZwvss7EpM70J5a6s5cIxT05a6UXSpGUCH20d8FeK7cJlXt7dK7nV46g`,
                    },
                });

                const orders = response.data.payload.Orders || [];
                allOrders = allOrders.concat(orders);
                nextToken = response.data.NextToken || null;
            } catch (error) {
                console.error('Error syncing sale:', error);
            }
        } while (nextToken);

        return allOrders;
    }

    private async getOrderItems(orderId: string) {
        try {
            const response = await axios.get(`${this.endpoint}/orders/v0/orders/${orderId}/orderItems`, {
                headers: {
                    'x-amz-access-token': `Atza|IwEBIOYVNgunlM3Y-T_Bqchi6B8M8JecaU7cN06cjViOOG3hUSOvM39miYYy0Fq29pSO4PBm2FXBHsWSBeu06rnhTBdJ6NR0OOoJazrh04Q12InbirNA_VeujXoLpBoltQ_HmSGUVIu63zarak2R-OE2B82Jrhetty38aeDGz5iFrG7Xbht50gO6z-DmugsNGEZTl-FYyOCo1Z6K0nU-ea3iChpqmWBiuV_FGjiD8f4BbQR8swQk5JTvbxN4Dy5El6kOO4kuQj0xPvePsSCE5ZlW2v9kFPDwaz1cBHDuF7ymv0kIhbkrPz6SEHUZwvss7EpM70J5a6s5cIxT05a6UXSpGUCH20d8FeK7cJlXt7dK7nV46g`,
                },
            });
            return response.data.payload.OrderItems || [];
        } catch (error) {
            console.error(`Error fetching order items for ${orderId}:`, error);
            return [];
        }
    }

    async inventoryFBA() {
        const result = await axios.get(
            `${this.endpoint}/fba/inventory/v1/summaries?details=true&granularityType=Marketplace&granularityId=${this.marketplaceId}&marketplaceIds=${this.marketplaceId}`
        );
    }
}
