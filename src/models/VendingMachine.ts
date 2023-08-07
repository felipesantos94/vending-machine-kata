export interface Result<T> {
  success: boolean,
  data?: T,
  error?: Error
  message?: string
}

export class VendingMachineModel {
  private static currentAmount: number = 0;
  private static coinChange: number = 0;

  public static async getInsertedAmount(): Promise<number> {    
    return this.currentAmount;
  }

  public static async getCoinChange(): Promise<number> {
    return this.coinChange;
  }

  public static async setInsertedAmount(amount: number): Promise<number> {
    return this.currentAmount = amount;
  }

  public static async setCoinChange(change: number): Promise<number> {
    return this.coinChange = change;
  }

  public static async resetCoinCounter(): Promise<void> {
    this.coinChange = 0;
    this.currentAmount = 0;
  }
}
