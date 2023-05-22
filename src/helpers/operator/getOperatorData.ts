import { Operator } from '../../types/Operator';

export const getOperatorData = async (operator: string) => {
  const operatorName = operator.replace(' ', '-');
  const makeRequest = await fetch(
    `https://rhodesapi.up.railway.app/api/operator/${operatorName}`
  );
  const json = await makeRequest.json() as Operator;
  return json;
};
