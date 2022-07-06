import fetch from 'node-fetch';
import { getOrSetToCache } from '../../../models/getOrSetToCache';
import { Operator } from '../../../types/Operator';

export const getOperatorData = async (operator: string) => {
  const operatorName = operator.replace(' ', '-');
  const response = await getOrSetToCache(`operator?=${operatorName}`, async () => {
    const makeRequest = await fetch(
      `https://rhodesapi.herokuapp.com/api/rhodes/operator/${operatorName}`
    );
    const json: Operator = await makeRequest.json();
    return json;
  });
  return response;
};
