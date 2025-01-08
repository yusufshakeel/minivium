import { Op } from '../core/Operators';
import { Filter, Condition } from '../types/where';

const actions: any = {
  [Op.eq]: (fieldValue: any, searchValue: any) => fieldValue === searchValue,
  [Op.notEq]: (fieldValue: any, searchValue: any) => fieldValue !== searchValue,
  [Op.in]: (needle: any | any[], haystack: any[]) => {
    if (Array.isArray(needle)) {
      return haystack.some(h => needle.includes(h));
    } else {
      return haystack.includes(needle);
    }
  },
  [Op.notIn]: (needle: any, haystack: any[]) => {
    if (Array.isArray(needle)) {
      return haystack.every(h => !needle.includes(h));
    } else {
      return !haystack.includes(needle);
    }
  },
  [Op.gt]: (fieldValue: any, searchValue: any) => fieldValue > searchValue,
  [Op.gte]: (fieldValue: any, searchValue: any) => fieldValue >= searchValue,
  [Op.lt]: (fieldValue: any, searchValue: any) => fieldValue < searchValue,
  [Op.lte]: (fieldValue: any, searchValue: any) => fieldValue <= searchValue,
  [Op.between]: (fieldValue: any, betweenValues: any) =>
    fieldValue >= betweenValues[0] && fieldValue <= betweenValues[1]
};

const evaluateCondition =
  (item: any, condition: Condition): boolean => {
    return Object.entries(condition).every(([column, conditionValue]) => {
      const itemValue = item[column];

      if (typeof conditionValue !== 'object') {
        return itemValue === conditionValue;
      }

      const conditionEntries = Object.entries(conditionValue);
      const [operator, value] = conditionEntries[0] as [any, any];

      if (!actions[operator]) {
        throw new Error(`Unsupported operator: ${operator}`);
      }

      return actions[operator](itemValue, value);
    });
  };

const evaluateWhere =
  (item: any, where: Filter): boolean => {
    if ('and' in where) {
      return where.and.every((condition: Filter) => evaluateWhere(item, condition));
    }
    if ('or' in where) {
      return where.or.some((condition: Filter) => evaluateWhere(item, condition));
    }
    return evaluateCondition(item, where as Condition);
  };

export function filter(data: any[], where?: Filter): any[] {
  if(!where) {
    return data;
  }
  return data.filter(item => evaluateWhere(item, where));
}
