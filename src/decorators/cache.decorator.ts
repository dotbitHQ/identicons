import * as cacheManager from 'cache-manager'
import md5 from 'blueimp-md5'

const memoryCache = cacheManager.caching({
  store: 'memory',
  max: 10000,
  ttl: 10
})

interface CacheConfig {
  key?: string
  ttl: number // seconds
}

/**
 * Memory cache
 * @param key
 * @param ttl
 * @constructor
 */
export function Cache({ key, ttl }: CacheConfig = { ttl: 10 }) {
  return function (
    target: Record<string, any>,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    if (!key) {
      key = `${target.constructor.name}/${propertyKey.toString()}`
    }
    const method = descriptor.value
    descriptor.value = async function (...args: any[]) {
      const cacheKey = key + md5(JSON.stringify(args))
      const cachedItem = await memoryCache.get(cacheKey)
      if (cachedItem) {
        return cachedItem
      }

      const result = await method.apply(this, args)
      await memoryCache.set(cacheKey, result, { ttl })
      return result
    }
  }
}
