export type ProductCode = '1' | '2' | '3';

export interface Product {
  name: 'Sprite Cola' | 'Bretz' | 'Snickers'
  type: 'cola' | 'chips' | 'candy',
  price: 1 | 0.5 | 0.65,
  quantity: number,
  code: ProductCode;
}

export interface Purchase {
  product: Product,
  change: number
}

export class ProductModel {
  private products: Record<string, Product> = {
    '1': {
      name: 'Sprite Cola',
      type: 'cola',
      price: 1,
      quantity: 7,
      code: '1',
    },
    '2': {
      name: 'Bretz',
      type: 'chips',
      price: 0.5,
      quantity: 6,
      code: '2',
    },
    '3': {
      name: 'Snickers',
      type: 'candy',
      price: 0.65,
      quantity: 10,
      code: '3',
    },
  };

  public async getProducts(): Promise<Product[]> {
    return Object.values(this.products);
  }

  public async updateProductInfo(product: Product): Promise<void> {
    if (this.products.hasOwnProperty(product.code)) {
      
      this.products[product.code] = product;
    }
  }
}
