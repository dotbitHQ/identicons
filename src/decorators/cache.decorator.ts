import fs from 'fs/promises'
import path from 'path'
import * as cacheManager from 'cache-manager'
import md5 from 'blueimp-md5'

const memoryCache = cacheManager.caching({
  store: 'memory',
  max: 10000,
  ttl: 10
})

interface CacheConfig {
  key?: string | ((...args: any[]) => string),
  ttl: number, // seconds
}

interface LocalCacheConfig {
  key?: string | ((...args: any[]) => string),
  dir: string,
}

/**
 * Memory cache
 * @param key
 * @param ttl
 * @constructor
 */
export function Cache ({ key, ttl }: CacheConfig = { ttl: 10 }) {
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

export function LocalCache ({ key, dir }: LocalCacheConfig = { dir: '' }): any {
  const cacheFolder = path.resolve(process.cwd(), '.cache', dir)
  console.log(`creating folder: ${cacheFolder}`)
  void fs.mkdir(cacheFolder, { recursive: true })

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
      const cacheKey = typeof key === 'string' ? key + md5(JSON.stringify(args)) : key.apply(this, args)
      const cacheFilePath = path.resolve(cacheFolder, cacheKey)

      try {
        return await fs.readFile(cacheFilePath)
      }
      catch (err) {}

      const result = await method.apply(this, args)

      await fs.writeFile(cacheFilePath, result)

      return result
    }
  }
}
