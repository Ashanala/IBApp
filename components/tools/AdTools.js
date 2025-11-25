import {AdEventType, InterstitialAd} from "react-native-google-mobile-ads";
import {RewardedAd, RewardedAdEventType} from "react-native-google-mobile-ads";

export function loadInterstitialAd(){
  const InterstitialAd_id = "ca-app-pub-9335898231322005/6838640354";
    const test_InterstitialAd_id = "ca-app-pub-3940256099942544/1033173712";
    const i = InterstitialAd.createForAdRequest(InterstitialAd_id);
    const unsubscribe_ad = i.addAdEventListener(AdEventType.LOADED, (payload) => {
      i.show();
    });
    i.load();
    return unsubscribe_ad;
}

export async function loadRewardAd(callback){
  const reward_ad_id = "ca-app-pub-9335898231322005/2547239220";
  const test_reward_ad_id = "ca-app-pub-3940256099942544/5224354917";
  const ad = RewardedAd.createForAdRequest(reward_ad_id);
  const loaded_unsubscribe = ad.addAdEventListener(
        RewardedAdEventType.LOADED,
        (payload) => {
          loaded_unsubscribe();
          ad.show();
        }
      );
  const rewarded_unsubscribe = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD,callback);
  ad.load();
  return rewarded_unsubscribe;
}

export function getBannerAdId(is_test){
  return is_test ? "ca-app-pub-3940256099942544/9214589741":"ca-app-pub-9335898231322005/2711693081"
}