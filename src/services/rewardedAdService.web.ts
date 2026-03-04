/**
 * Rewarded Ad Service (Web)
 *
 * Web stub implementation - ads are not supported on web platform.
 * All functions return null or are no-ops.
 */

export interface RewardedAdCallbacks {
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: Error) => void;
  onAdOpened?: () => void;
  onAdFailedToShow?: (error: Error) => void;
  onUserEarnedReward: (reward: { type: string; amount: number }) => void;
  onAdClosed?: () => void;
}

/**
 * Load a rewarded ad (web stub - returns null)
 */
export function loadRewardedAd(): Promise<any> {
  console.log('[RewardedAdService] Ads not available on web');
  return Promise.resolve(null);
}

/**
 * Show a rewarded ad (web stub - no-op)
 */
export function showRewardedAd(
  ad: any,
  callbacks: RewardedAdCallbacks
): void {
  console.log('[RewardedAdService] Ads not available on web');
}

/**
 * Check if rewarded ads are available (web stub - returns false)
 */
export function isRewardedAdAvailable(): boolean {
  return false;
}
