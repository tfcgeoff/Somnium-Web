/**
 * Rewarded Ad Service
 *
 * Handles loading and showing rewarded ads using react-native-google-mobile-ads.
 * Tracks whether user has earned the reward to unlock features.
 */

import { Platform } from 'react-native';

let RewardedAd: any, RewardedAdEventType: any, TestIds: any;
let adsAvailable = false;

// Only try to load ads module on native platforms (not web)
if (Platform.OS !== 'web') {
  try {
    const ads = require('react-native-google-mobile-ads');
    RewardedAd = ads.RewardedAd;
    RewardedAdEventType = ads.RewardedAdEventType;
    TestIds = ads.TestIds;
    adsAvailable = true;
  } catch (e) {
    console.log('[RewardedAdService] Google Mobile Ads not available (Expo Go or missing native module)');
    adsAvailable = false;
  }
}

const AD_UNIT_ID = adsAvailable ? Platform.select({
  ios: 'ca-app-pub-7397469957968727/2551135895', // ImageGen rewarded ad unit ID
  android: 'ca-app-pub-7397469957968727/2551135895', // ImageGen rewarded ad unit ID
  default: TestIds.REWARDED,
}) : null;

export interface RewardedAdCallbacks {
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: Error) => void;
  onAdOpened?: () => void;
  onAdFailedToShow?: (error: Error) => void;
  onUserEarnedReward: (reward: { type: string; amount: number }) => void;
  onAdClosed?: () => void;
}

/**
 * Load a rewarded ad
 * @returns Promise resolving to the loaded ad instance or null if ads unavailable
 */
export function loadRewardedAd(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!adsAvailable || !RewardedAd) {
      console.log('[RewardedAdService] Ads not available, returning null');
      resolve(null);
      return;
    }

    const ad = RewardedAd.forAd(AD_UNIT_ID);

    const unsubscribe = ad.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        unsubscribe();
        console.log('[RewardedAdService] Rewarded ad loaded');
        resolve(ad);
      }
    );

    ad.addAdEventListener(RewardedAdEventType.FAILED_TO_LOAD, (error: any) => {
      unsubscribe();
      console.error('[RewardedAdService] Rewarded ad failed to load:', error);
      reject(error);
    });

    ad.load();
  });
}

/**
 * Show a rewarded ad with callbacks
 * @param ad - The loaded ad instance
 * @param callbacks - Event callbacks
 */
export function showRewardedAd(
  ad: any,
  callbacks: RewardedAdCallbacks
): void {
  if (!ad) {
    console.log('[RewardedAdService] No ad to show');
    return;
  }

  const {
    onAdLoaded,
    onAdFailedToLoad,
    onAdOpened,
    onAdFailedToShow,
    onUserEarnedReward,
    onAdClosed,
  } = callbacks;

  // Subscribe to events
  const unsubscribeLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, onAdLoaded || (() => {}));
  const unsubscribeFailedToLoad = ad.addAdEventListener(RewardedAdEventType.FAILED_TO_LOAD, (error: Error) => {
    unsubscribeLoaded();
    onAdFailedToLoad?.(error);
  });
  const unsubscribeOpened = ad.addAdEventListener(RewardedAdEventType.OPENED, onAdOpened || (() => {}));
  const unsubscribeFailedToShow = ad.addAdEventListener(RewardedAdEventType.FAILED_TO_SHOW, (error: Error) => {
    unsubscribeOpened();
    onAdFailedToShow?.(error);
  });
  const unsubscribeEarnedReward = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward: any) => {
    console.log('[RewardedAdService] User earned reward:', reward);
    onUserEarnedReward(reward);
  });
  const unsubscribeClosed = ad.addAdEventListener(RewardedAdEventType.CLOSED, () => {
    unsubscribeOpened();
    unsubscribeFailedToShow();
    unsubscribeEarnedReward();
    onAdClosed?.();
  });

  // Show the ad
  ad.show();
}

/**
 * Check if rewarded ads are available
 */
export function isRewardedAdAvailable(): boolean {
  return adsAvailable;
}
