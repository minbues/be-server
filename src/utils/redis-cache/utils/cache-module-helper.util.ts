import { CACHE_ENUM } from '../const/cache-enum.const';

export class CacheModuleHelper {
  static makeGameStateCacheKey(userId: string, partnerCode: string) {
    return CACHE_ENUM.PREFIX_KEY_NAME_STATE + '-' + userId + '-' + partnerCode;
  }

  static makeRedLockCacheKey(
    userId: string,
    partnerCode: string,
    type: string,
  ) {
    return (
      CACHE_ENUM.PREFIX_KEY_NAME_STATE +
      '-' +
      userId +
      '-' +
      partnerCode +
      '-' +
      type
    );
  }

  static makeRedLockCacheKeyCommon(key: string) {
    return CACHE_ENUM.PREFIX_KEY_NAME_STATE + '-' + key;
  }
}
