export interface AwsOrder {
    Account: Account;
    OrderID: string; //AmazonOrderId
    OrderDate: Date; //PurchaseDate
    Barcode?: string;
    Product: Product[];
    OrderValue?: number; //OrderTotal.Amount
    OrderStatus: string; //OrderStatus
}

interface Account {
    Email?: string; //BuyerEmail
    Name?: string; //BuyerName
}

export interface Product {
    Id: string; //OrderItemId
    Name: string; //Title
    SKU: string; //SellerSKU
    Quantity: number; //ProductInfo.NumberOfItems
}
