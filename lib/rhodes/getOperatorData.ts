import fetch from 'node-fetch';
import { Operator } from '../../src/types/Operator';

export const getOperatorData = async (operator: string) => {
  const operatorName = operator.replace(' ', '-');
  const response = await fetch(
    `https://rhodesapi.herokuapp.com/api/rhodes/operator/${operatorName}`
  );
  const json: Operator = await response.json();
  return json;
};
