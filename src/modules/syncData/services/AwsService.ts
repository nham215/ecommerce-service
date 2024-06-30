import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as moment from 'moment-timezone';
import { AwsOrder, Product } from '../model/Aws';

@Injectable()
export class AwsService {
    private now: string;
    private yesterday: string;
    private endpoint: string;
    private marketplaceId: string;

    constructor() {
        this.now = moment.tz('Europe/London').format('YYYY-MM-DD');
        this.yesterday = moment.tz('Europe/London').subtract(1, 'days').format('YYYY-MM-DD');
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
        const accessToken = await this.getAccessToken(process.env.AWS_KEY_DEMIE);
        const orders: AwsOrder[] = [];
        const _orders = await this.getOrders(accessToken);

        await Promise.all(
            _orders.map(async (order) => {
                const orderItems = await this.getOrderItems(order.AmazonOrderId, accessToken);
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

    async getOrders(access: string) {
        let nextToken: string | undefined = undefined;
        let allOrders = [];

        do {
            try {
                const response = await axios.get(`${this.endpoint}/orders/v0/orders`, {
                    params: {
                        MarketplaceIds: this.marketplaceId,
                        CreatedBefore: this.now,
                        CreatedAfter: this.yesterday,
                        NextToken: nextToken,
                    },
                    headers: {
                        'x-amz-access-token': `${access}`,
                    },
                });

                const orders = response.data.payload.Orders || [];
                allOrders = allOrders.concat(orders);
                nextToken = response.data.payload.NextToken || undefined;
            } catch (error) {
                console.error('Error syncing sale:', error);
            }
        } while (nextToken);

        return allOrders;
    }

    private async getOrderItems(orderId: string, access: string) {
        try {
            const response = await axios.get(`${this.endpoint}/orders/v0/orders/${orderId}/orderItems`, {
                headers: {
                    'x-amz-access-token': `${access}`,
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
