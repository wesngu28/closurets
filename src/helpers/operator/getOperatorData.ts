import fetch from 'node-fetch';
import { getOrSetToCache } from '../../models/getOrSetToCache';
import { Operator } from '../../types/Operator';

export const getOperatorData = async (operator: string) => {
  const operatorName = operator.replace(' ', '-');
  const response: Operator | { error: 'Operator not found' } = await getOrSetToCache(
    `operator?=${operatorName}`,
    async () => {
      const makeRequest = await fetch(
        `https://rhodesapi.cyclic.app/api/operator/${operatorName}`
      );
      const json: Operator = await makeRequest.json();
      return json;
    }
  );
  return response;
};
