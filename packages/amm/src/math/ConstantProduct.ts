import { Decimal, AMMCalculation } from '@fry-exchange/common';

/**
 * Constant Product AMM (x * y = k)
 * Used by Uniswap V2 style pools
 */
export class ConstantProductAMM {
  /**
   * Calculate output amount for a swap
   * Uses formula: dy = (y * dx) / (x + dx) * (1 - fee)
   */
  static calculateSwap(
    inputAmount: Decimal,
    inputReserve: Decimal,
    outputReserve: Decimal,
    fee: Decimal
  ): AMMCalculation {
    if (inputAmount.isZero() || inputReserve.isZero() || outputReserve.isZero()) {
      throw new Error('Invalid input or reserves');
    }

    // Calculate fee
    const feeAmount = inputAmount.mul(fee);
    const inputAfterFee = inputAmount.minus(feeAmount);

    // Calculate output using constant product formula
    // dy = (y * dx) / (x + dx)
    const numerator = outputReserve.mul(inputAfterFee);
    const denominator = inputReserve.plus(inputAfterFee);
    const outputAmount = numerator.div(denominator);

    // New reserves
    const newInputReserve = inputReserve.plus(inputAmount);
    const newOutputReserve = outputReserve.minus(outputAmount);

    // Calculate price impact
    // Price before = outputReserve / inputReserve
    // Price after = newOutputReserve / newInputReserve
    // Impact = 1 - (price after / price before)
    const priceBefore = outputReserve.div(inputReserve);
    const priceAfter = newOutputReserve.div(newInputReserve);
    const priceImpact = new Decimal(1).minus(priceAfter.div(priceBefore));

    return {
      inputAmount,
      outputAmount,
      fee: feeAmount,
      newBaseReserve: newInputReserve,
      newQuoteReserve: newOutputReserve,
      priceImpact,
    };
  }

  /**
   * Calculate input amount needed for desired output
   * Uses formula: dx = (x * dy) / ((y - dy) * (1 - fee))
   */
  static calculateSwapForExactOutput(
    outputAmount: Decimal,
    inputReserve: Decimal,
    outputReserve: Decimal,
    fee: Decimal
  ): AMMCalculation {
    if (outputAmount.isZero() || inputReserve.isZero() || outputReserve.isZero()) {
      throw new Error('Invalid output or reserves');
    }

    if (outputAmount.greaterThanOrEqualTo(outputReserve)) {
      throw new Error('Output exceeds reserve');
    }

    // Calculate input needed (before fee)
    // dx = (x * dy) / (y - dy)
    const numerator = inputReserve.mul(outputAmount);
    const denominator = outputReserve.minus(outputAmount);
    const inputBeforeFee = numerator.div(denominator);

    // Add fee to get total input
    const inputAmount = inputBeforeFee.div(new Decimal(1).minus(fee));
    const feeAmount = inputAmount.minus(inputBeforeFee);

    // New reserves
    const newInputReserve = inputReserve.plus(inputAmount);
    const newOutputReserve = outputReserve.minus(outputAmount);

    // Calculate price impact
    const priceBefore = outputReserve.div(inputReserve);
    const priceAfter = newOutputReserve.div(newInputReserve);
    const priceImpact = new Decimal(1).minus(priceAfter.div(priceBefore));

    return {
      inputAmount,
      outputAmount,
      fee: feeAmount,
      newBaseReserve: newInputReserve,
      newQuoteReserve: newOutputReserve,
      priceImpact,
    };
  }

  /**
   * Calculate LP tokens to mint for adding liquidity
   * First deposit: sqrt(x * y)
   * Subsequent: min(dx/x, dy/y) * totalSupply
   */
  static calculateLiquidityMint(
    baseAmount: Decimal,
    quoteAmount: Decimal,
    baseReserve: Decimal,
    quoteReserve: Decimal,
    totalSupply: Decimal
  ): { lpTokens: Decimal; optimalBaseAmount: Decimal; optimalQuoteAmount: Decimal } {
    if (totalSupply.isZero()) {
      // First liquidity provider
      const lpTokens = baseAmount.mul(quoteAmount).sqrt();
      return { lpTokens, optimalBaseAmount: baseAmount, optimalQuoteAmount: quoteAmount };
    }

    // Calculate optimal amounts to maintain ratio
    const baseRatio = baseAmount.div(baseReserve);
    const quoteRatio = quoteAmount.div(quoteReserve);

    let optimalBaseAmount: Decimal;
    let optimalQuoteAmount: Decimal;
    let shareRatio: Decimal;

    if (baseRatio.lessThan(quoteRatio)) {
      // Use all base, reduce quote
      optimalBaseAmount = baseAmount;
      optimalQuoteAmount = baseAmount.mul(quoteReserve).div(baseReserve);
      shareRatio = baseRatio;
    } else {
      // Use all quote, reduce base
      optimalQuoteAmount = quoteAmount;
      optimalBaseAmount = quoteAmount.mul(baseReserve).div(quoteReserve);
      shareRatio = quoteRatio;
    }

    const lpTokens = shareRatio.mul(totalSupply);

    return { lpTokens, optimalBaseAmount, optimalQuoteAmount };
  }

  /**
   * Calculate amounts received for removing liquidity
   */
  static calculateLiquidityRemoval(
    lpTokenAmount: Decimal,
    baseReserve: Decimal,
    quoteReserve: Decimal,
    totalSupply: Decimal
  ): { baseAmount: Decimal; quoteAmount: Decimal } {
    if (totalSupply.isZero()) {
      throw new Error('Pool has no liquidity');
    }

    const sharePercent = lpTokenAmount.div(totalSupply);
    const baseAmount = baseReserve.mul(sharePercent);
    const quoteAmount = quoteReserve.mul(sharePercent);

    return { baseAmount, quoteAmount };
  }

  /**
   * Get current price (quote per base)
   */
  static getPrice(baseReserve: Decimal, quoteReserve: Decimal): Decimal {
    if (baseReserve.isZero()) {
      throw new Error('Base reserve is zero');
    }
    return quoteReserve.div(baseReserve);
  }

  /**
   * Calculate the k constant
   */
  static getK(baseReserve: Decimal, quoteReserve: Decimal): Decimal {
    return baseReserve.mul(quoteReserve);
  }
}
