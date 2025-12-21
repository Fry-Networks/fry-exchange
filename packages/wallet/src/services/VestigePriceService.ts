import { Decimal, VESTIGE_API, FRY_TOKEN } from '@fry-exchange/common';

/**
 * Response structure from Vestige API for asset price
 */
interface VestigeAssetPrice {
  price: number;
  price_24h_change?: number;
  volume_24h?: number;
  liquidity?: number;
}

/**
 * Cached price data with timestamp
 */
interface CachedPrice {
  price: Decimal;
  timestamp: number;
}

/**
 * Service for fetching token prices from Vestige API
 * Vestige is the most reliable data platform for Algorand assets
 */
export class VestigePriceService {
  private priceCache: Map<number, CachedPrice> = new Map();

  /**
   * Get the current USD price for an ASA from Vestige
   * @param asaId - Algorand Standard Asset ID
   * @returns Price in USD as Decimal
   */
  async getAssetPrice(asaId: number): Promise<Decimal> {
    // Check cache first
    const cached = this.priceCache.get(asaId);
    const now = Date.now();

    if (cached && now - cached.timestamp < VESTIGE_API.CACHE_DURATION_MS) {
      return cached.price;
    }

    try {
      const response = await fetch(
        `${VESTIGE_API.BASE_URL}/asset/${asaId}/price`
      );

      if (!response.ok) {
        // If price endpoint fails, try the main asset endpoint
        const assetResponse = await fetch(
          `${VESTIGE_API.BASE_URL}/asset/${asaId}`
        );

        if (!assetResponse.ok) {
          throw new Error(`Vestige API error: ${assetResponse.status}`);
        }

        const assetData = await assetResponse.json() as VestigeAssetPrice;
        const price = new Decimal(assetData.price || 0);

        this.priceCache.set(asaId, { price, timestamp: now });
        return price;
      }

      const data = await response.json() as { price: number };
      const price = new Decimal(data.price || 0);

      // Update cache
      this.priceCache.set(asaId, { price, timestamp: now });

      return price;
    } catch (error) {
      // If we have a stale cache, return it rather than failing
      if (cached) {
        console.warn(
          `Failed to fetch price for ASA ${asaId}, using stale cache:`,
          error
        );
        return cached.price;
      }

      throw new Error(
        `Failed to fetch price for ASA ${asaId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get the current USD price for FRY token
   * @returns FRY price in USD as Decimal
   */
  async getFryPrice(): Promise<Decimal> {
    return this.getAssetPrice(FRY_TOKEN.ASA_ID);
  }

  /**
   * Convert a USD amount to FRY tokens
   * @param usdAmount - Amount in USD
   * @returns Amount in FRY tokens
   */
  async usdToFry(usdAmount: Decimal): Promise<Decimal> {
    const fryPrice = await this.getFryPrice();

    if (fryPrice.isZero()) {
      throw new Error('FRY price is zero, cannot convert');
    }

    return usdAmount.div(fryPrice);
  }

  /**
   * Convert FRY tokens to USD
   * @param fryAmount - Amount in FRY tokens
   * @returns Amount in USD
   */
  async fryToUsd(fryAmount: Decimal): Promise<Decimal> {
    const fryPrice = await this.getFryPrice();
    return fryAmount.mul(fryPrice);
  }

  /**
   * Get multiple asset prices in a batch
   * @param asaIds - Array of ASA IDs
   * @returns Map of ASA ID to price
   */
  async getMultipleAssetPrices(
    asaIds: number[]
  ): Promise<Map<number, Decimal>> {
    const prices = new Map<number, Decimal>();

    // Fetch prices in parallel
    const results = await Promise.allSettled(
      asaIds.map((id) => this.getAssetPrice(id))
    );

    asaIds.forEach((id, index) => {
      const result = results[index];
      if (result.status === 'fulfilled') {
        prices.set(id, result.value);
      } else {
        console.warn(`Failed to fetch price for ASA ${id}:`, result.reason);
        prices.set(id, new Decimal(0));
      }
    });

    return prices;
  }

  /**
   * Clear the price cache
   */
  clearCache(): void {
    this.priceCache.clear();
  }

  /**
   * Invalidate cache for a specific asset
   * @param asaId - ASA ID to invalidate
   */
  invalidateCache(asaId: number): void {
    this.priceCache.delete(asaId);
  }
}

export const vestigePriceService = new VestigePriceService();
