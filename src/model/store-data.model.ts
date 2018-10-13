export interface InvoiceData {
  invoice: Invoice;
  hash: string;
}

export interface Invoice {
  date: string;
  billNo: number;
  seller:Seller;
  products: Product[];
  totalCostBrutto: number;
  totalCostNetto: number;
  customerPaid: number;
  tax: number;
}

export interface Seller {
  name: string;
  address: Address;
  ustIdNr: string
  storeID: string;
  checkoutLane: number;
}

export interface Product {
  name: string;
  count: number;
  itemPrice: number;
}

export interface Address {
  street: string;
  zip: string;
  city: string;
}
