import { Product, ProductCode, ProductModel } from '../models/Product';

export class ProductService {
  private productModel: ProductModel = new ProductModel();

  public async selectProduct(code: ProductCode): Promise<Product | void> {
    try {
      const products: Product[] = await this.productModel.getProducts();
      const [selectedProduct]: Product[] = products.filter((p) => p.code === code);

      if (selectedProduct && 'code' in selectedProduct) {
        return selectedProduct;
      }

      throw new Error("Product not available");
    } catch (error) {
      return undefined;
    }
  }
}