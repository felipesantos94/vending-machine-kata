import { VendingMachineModel, Result } from '../models/VendingMachine';
import { CoinMeasurements, ValidCoin } from '../models/Coin';
import { ProductCode, ProductModel, Purchase } from '../models/Product';
import { ProductService } from './Product';

export class VendingMachineService {
  private productModel = new ProductModel();
  private productService = new ProductService();

  public async insertableCoin(coin: CoinMeasurements): Promise<boolean> {
    const validWeight = ['2g', '3g', '4g', '7g'];
    const validSize = ['16mm', '21mm', '19mm', '24mm'];

    return (
      coin !== null &&
      typeof coin === 'object' &&
      'weight' in coin &&
      'size' in coin &&
      validWeight.includes(coin.weight) &&
      validSize.includes(coin.size)
    );
  }

  public async verifyCoinType(measure: CoinMeasurements): Promise<Result<ValidCoin>> {
    try {
      const isCoin = await this.insertableCoin(measure);
      if (isCoin) {
        const key = `${measure.weight}-${measure.size}`;
        const validCoinMap: Record<string, ValidCoin> = {
          '3g-21mm': { type: 'nickel', value: 0.05 },
          '4g-19mm': { type: 'dime', value: 0.10 },
          '7g-24mm': { type: 'quarter', value: 0.25 },
        };
    
        if (validCoinMap[key]) {
          return {
            success: true,
            data: validCoinMap[key]
          };
        } 
        
        if (key === '2g-16mm') {
          const currentCoinChange = await VendingMachineModel.getCoinChange();
          await VendingMachineModel.setCoinChange(currentCoinChange + 0.01);
        }
      }

      throw new Error('The coin is not valid');
      
    } catch (error: any) {
      return {
        success: false,
        error: error,
        message: error.message
      };
    }
  }

  public async insertCoin(coin: CoinMeasurements): Promise<Result<number>> {
    try {
      const verifyResult = await this.verifyCoinType(coin);
      const insertedCoin = verifyResult.data;
      
      if (!insertedCoin) {
        throw new Error('Coin not accepted');
      }
  
      if (insertedCoin && insertedCoin.value > 0) {
        const currentAmount = await VendingMachineModel.getInsertedAmount();
        const sanitizedValue = Number((currentAmount + insertedCoin.value).toFixed(2));
        await VendingMachineModel.setInsertedAmount(sanitizedValue);
      }

      const insertedAmount = await VendingMachineModel.getInsertedAmount();  
      return {
        success: true,
        data: insertedAmount
      };
    } catch (error: any) {
      return {
        success: false,
        error: error,
        message: error.message
      };
    }
  }

  public async selectProductByCode(code: ProductCode): Promise<Result<Purchase>> {
    try {
      const product = await this.productService.selectProduct(code);
      const availableCoins = await VendingMachineModel.getInsertedAmount();

      if (product) {
        if ('quantity' in product && product.quantity <= 0) {
          throw new Error('The product is sold out');
        }

        if ('price' in product && product.price > availableCoins) {
          throw new Error('Not enough money');
        }
        
        const change = await VendingMachineModel.setCoinChange(availableCoins - product.price);
        product.quantity = product.quantity-1;

        await this.productModel.updateProductInfo(product);
        await VendingMachineModel.resetCoinCounter();

        const purchase: Purchase = {
          product, 
          change: Number(change.toFixed(2))
        };

        return {
          success: true,
          data: purchase
        };
      }

      throw new Error('The product not available');
    } catch (error: any) {
      return {
        success: false,
        error: error,
        message: error.message
      };
    }
  }

  public async returnCoins(): Promise<Result<number>> {
    try {
      const inserted = await VendingMachineModel.getInsertedAmount();
      const currentChange = await VendingMachineModel.getCoinChange();

      await VendingMachineModel.setCoinChange(inserted + currentChange);
      const returnedCoins = await VendingMachineModel.getCoinChange();
      await VendingMachineModel.resetCoinCounter();
      
      return {
        success: true,
        data: returnedCoins
      };
    } catch (error: any) {
      return {
        success: false,
        error: error,
        message: error.message
      };
    }
  }
}