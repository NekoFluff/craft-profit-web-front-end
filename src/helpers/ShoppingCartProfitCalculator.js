class ProfitCalculator {

  static valuePackEnabled = false;
  static TAX_PERCENTAGE = 0.65;

  static calculateProfitValuesForItem(item) {
    const { shoppingCartData } = item;
    let {
      expectedCount: count,
      individualPrice,
      cumulativeTimeSpent,
    } = shoppingCartData[0];

    const marketPrice = item.getMarketPrice()
    return {profit: this.calculateProfit(marketPrice, individualPrice), profitPerSecond: this.calculateProfitPerSecond(marketPrice, individualPrice, cumulativeTimeSpent)}
  }
  
  static calculateProfit(marketPrice, individualPrice) {
    let sellingPrice = marketPrice * this.TAX_PERCENTAGE;
    if (this.valuePackEnabled) sellingPrice = 1.3 * sellingPrice;
    console.log('Total Profit | Selling Price', sellingPrice, individualPrice)
    const profit = sellingPrice - individualPrice;
    return profit
  }

  static calculateProfitPerSecond(marketPrice, individualPrice, cumulativeTimeSpent) {
    const profit = this.calculateProfit(marketPrice, individualPrice)
    const profitPerSecond = Math.floor(profit / cumulativeTimeSpent);
    return profitPerSecond
  }
  

}

export default ProfitCalculator

