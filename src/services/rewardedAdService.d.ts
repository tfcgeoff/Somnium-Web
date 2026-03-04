/**
 * Type declarations for rewardedAdService
 * This helps TypeScript resolve the platform-specific .native.ts and .web.ts files
 */

export interface RewardedAdCallbacks {
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: Error) => void;
  onAdOpened?: () => void;
  onAdFailedToShow?: (error: Error) => void;
  onUserEarnedReward: (reward: { type: string; amount: number }) => void;
  onAdClosed?: () => void;
}

export function loadRewardedAd(): Promise<any>;
export function showRewardedAd(ad: any, callbacks: RewardedAdCallbacks): void;
export function isRewardedAdAvailable(): boolean;
