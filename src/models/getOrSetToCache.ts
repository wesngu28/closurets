import { RedisClient } from './redis';

export async function getOrSetToCache(key: string, callback: Function) {
  await RedisClient.init();
  const data = await RedisClient.client.get(key);
  if (data) {
    await RedisClient.kill();
    return JSON.parse(data);
  }
  const response = await callback();
  if (response === undefined) {
    await RedisClient.kill();
    return undefined;
  }
  RedisClient.client.setEx(key, RedisClient.expirationDefault, JSON.stringify(response));
  await RedisClient.kill();
  return response;
}
