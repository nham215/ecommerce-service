import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as xmlrpc from 'xmlrpc';
import { Odoo, ProductData } from '../model/Odoo';

@Injectable()
export class OdooService {
  private clientCommon: any;
  private clientObject: any;
  private url: string;
  private db: string;
  private username: string;
  private password: string;
  private uid: number;

  constructor() {
    this.url = process.env.ODOO_URL;
    this.db = process.env.ODOO_DB;
    this.username = process.env.ODOO_USER_NAME;
    this.password = process.env.ODOO_API_KEYS;

    this.clientCommon = xmlrpc.createClient({
      url: this.url + '/xmlrpc/2/common',
    });

    this.clientObject = xmlrpc.createClient({
      url: this.url + '/xmlrpc/2/object',
    });
  }

  private execute_kw(
    model: string,
    method: string,
    params: any[],
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.clientObject.methodCall(
        'execute_kw',
        [this.db, this.uid, this.password, model, method, params],
        (error, value) => {
          if (error) {
            reject(error);
          } else {
            resolve(value);
          }
        },
      );
    });
  }

  private authenticate(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.clientCommon.methodCall(
        'authenticate',
        [this.db, this.username, this.password, {}],
        (error, uid) => {
          if (error) {
            reject(error);
          } else {
            this.uid = uid;
            resolve(uid);
          }
        },
      );
    });
  }

  async init() {
    if (!this.uid) {
      await this.authenticate();
    }
  }

  async findCustomerByName(customerName: string): Promise<number> {
    await this.init();
    const params = [[['name', '=', customerName]]];
    const customerIds: number[] = await this.execute_kw(
      'res.partner',
      'search',
      params,
    );
    if (!customerIds || customerIds.length === 0) {
      throw new Error(`Customer ${customerName} not found`);
    }
    return customerIds[0];
  }

  async findWarehouseByName(warehouseName: string): Promise<number> {
    await this.init();
    const params = [[['name', '=', warehouseName]]];
    const warehouseIds: number[] = await this.execute_kw(
      'stock.warehouse',
      'search',
      params,
    );
    if (!warehouseIds || warehouseIds.length === 0) {
      throw new Error(`Warehouse ${warehouseName} not found`);
    }
    return warehouseIds[0];
  }

  async findProductByInternalReference(
    internalReference: string,
  ): Promise<number> {
    await this.init();
    const params = [[['default_code', '=', internalReference]]];
    const productIds: number[] = await this.execute_kw(
      'product.product',
      'search',
      params,
    );
    if (!productIds || productIds.length === 0) {
      throw new Error(
        `Product with Internal Reference ${internalReference} not found`,
      );
    }
    return productIds[0];
  }

  async createSaleOrder(
    customerId: number,
    warehouseId: number,
    customerReference: string,
  ): Promise<number> {
    await this.init();
    const orderData = {
      partner_id: customerId,
      warehouse_id: warehouseId,
      client_order_ref: customerReference,
      order_line: [],
    };
    const orderId = await this.execute_kw('sale.order', 'create', [orderData]);
    return orderId;
  }

  async createOrderLine(
    orderId: number,
    product: ProductData,
  ): Promise<number> {
    await this.init();
    const productId = await this.findProductByInternalReference(
      product.internalReference,
    );
    const orderLineData = {
      order_id: orderId,
      product_id: productId,
      product_uom_qty: product.quantity,
      price_unit: product.price,
      name: product.internalReference,
    };
    const orderLineId = await this.execute_kw('sale.order.line', 'create', [
      orderLineData,
    ]);
    return orderLineId;
  }

  async syncSale(odooData: Odoo): Promise<number> {
    const customerId = await this.findCustomerByName(odooData.customerName);
    const warehouseId = await this.findWarehouseByName(odooData.warehouseName);
    const orderId = await this.createSaleOrder(
      customerId,
      warehouseId,
      odooData.customerReference,
    );

    for (const product of odooData.productData) {
      await this.createOrderLine(orderId, product);
    }

    return orderId;
  }
}
