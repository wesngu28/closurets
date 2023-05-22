// import { RedisClient } from './redis';

// export async function getOrSetToCache(key: string, callback: Function) {
//   const data = await RedisClient.client.get(key);
//   if (data) {
//     return JSON.parse(data);
//   }
//   const response = await callback();
//   if (response === undefined) {
//     return undefined;
//   }
//   RedisClient.client.setEx(key, RedisClient.expirationDefault, JSON.stringify(response));
//   return response;
// }
