import { CoinMeasurements } from '../src/models/Coin';
import { Purchase } from '../src/models/Product';
import { VendingMachineModel } from '../src/models/VendingMachine';
import { ProductService } from '../src/services/Product';
import { VendingMachineService } from '../src/services/VendingMachine';

let productService: ProductService;
let vendingMachineService: VendingMachineService;
let penny: CoinMeasurements;
let nickel: CoinMeasurements;
let dime: CoinMeasurements;
let quarter: CoinMeasurements;

beforeAll(() => {
  penny = { weight: '2g', size: '16mm' };
  nickel = { weight: '3g', size: '21mm' };
  dime = { weight: '4g', size: '19mm' };
  quarter = { weight: '7g', size: '24mm' };
});

beforeEach(async () => {
  jest.resetModules();
  jest.restoreAllMocks();

  productService = new ProductService();
  vendingMachineService = new VendingMachineService();

  await VendingMachineModel.setInsertedAmount(0);
  await VendingMachineModel.setCoinChange(0);  
});

describe('Vending Machine - Accept Valid Coins', () => {
  it('should accept valid coins (nickels, dimes, quarters), adds it to the current inserted amount cache', async () => {
    const nickelResult = await vendingMachineService.insertCoin(nickel);
    expect(nickelResult.data).toBe(0.05);

    const dimeResult = await vendingMachineService.insertCoin(dime);
    expect(dimeResult.data).toBe(0.15);

    const quarterResult = await vendingMachineService.insertCoin(quarter);
    expect(quarterResult.data).toBe(0.40);
  });
});

describe('Vending Machine - Reject Pennies', () => {
  it('should not process pennies', async () => {
    const pennyResult = await vendingMachineService.insertCoin(penny);

    expect(pennyResult.error instanceof Error).toBe(true);
    expect(pennyResult.message).toBe('Coin not accepted');
  })

  it('should return them coin as a change without modifying the current amount', async () => {
    await vendingMachineService.insertCoin(penny);
    await vendingMachineService.insertCoin(penny);

    expect(await VendingMachineModel.getInsertedAmount()).toBe(0);
    expect(await VendingMachineModel.getCoinChange()).toBe(0.02);
  })
})

describe('Vending Machine - Select Product', () => {
  it('should return the purchase and change equal zero if the exact money was inserted', async () => {
    await VendingMachineModel.setInsertedAmount(1);
    const colaResult = await vendingMachineService.selectProductByCode('1');
    const cola = colaResult.data;

    expect(cola && cola as Purchase && 'product' in cola).toBe(true);
    
    await VendingMachineModel.setInsertedAmount(0.5);
    const chipsResult = await vendingMachineService.selectProductByCode('2');
    const chips = chipsResult.data;

    expect(chips && chips as Purchase && 'product' in chips).toBe(true);

    await VendingMachineModel.setInsertedAmount(0.65);
    const candyResult = await vendingMachineService.selectProductByCode('3');
    const candy = candyResult.data;

    expect(candy && candy as Purchase && 'product' in candy).toBe(true);

    expect(await VendingMachineModel.getCoinChange()).toBe(0);
  })

  it('should return the purchase and change if the value of coins inserted is higher than the price of the product', async () => {
    await VendingMachineModel.setInsertedAmount(1000);
    const colaResult = await vendingMachineService.selectProductByCode('1');
    const cola = colaResult.data;

    expect(cola && cola as Purchase && 'product' in cola).toBe(true);
    expect(cola && cola.change).toBe(999);

    
    await VendingMachineModel.setInsertedAmount(2);
    const chipsResult = await vendingMachineService.selectProductByCode('2');
    const chips = chipsResult.data;

    expect(chips && chips as Purchase && 'product' in chips).toBe(true);
    expect(chips && chips.change).toBe(1.5);


    await VendingMachineModel.setInsertedAmount(1.20);
    const candyResult = await vendingMachineService.selectProductByCode('3');
    const candy = candyResult.data;

    expect(candy && candy as Purchase && 'product' in candy).toBe(true);
    expect(candy && candy.change).toBe(0.55);
  })

  it('should warn the user that the product is sold out', async () => {
    const product = await productService.selectProduct('1');
    if (product && 'quantity' in product) {
      for (let i = 0; i < product.quantity; i++) {
        await VendingMachineModel.setInsertedAmount(1); 
        await vendingMachineService.selectProductByCode('1');
      }
    }

    await VendingMachineModel.setInsertedAmount(1);
    const result = await vendingMachineService.selectProductByCode('1');

    expect(result.error instanceof Error).toBe(true);
    expect(result.message).toBe('The product is sold out');
  })
})