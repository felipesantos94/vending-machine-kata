export interface CoinMeasurements {
  weight: '2g' | '3g' | '4g' | '7g';
  size: '16mm' | '21mm' | '19mm' | '24mm';
}

export interface ValidCoin {
  type: 'nickel' | 'dime' | 'quarter';
  value: 0.05 | 0.10 | 0.25;
}