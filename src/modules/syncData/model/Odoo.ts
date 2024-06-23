export interface OdooConnect {
  url: string;
  db: string;
  username: string;
  password: string;
}

export interface Odoo {
  customerName: string;
  warehouseName: string;
  customerReference: string;
  productData: ProductData[];
}

export interface ProductData {
  internalReference: string;
  quantity: number;
  price: number;
}
