import { Op } from '../core/Operators';
import { Filter, Condition } from '../types/where';

const actions: any = {
  [Op.eq]: (itemValue: any, value: any) => itemValue === value,
  [Op.notEq]: (itemValue: any, value: any) => itemValue !== value,
  [Op.in]: (itemValue: any, value: any) => value.includes(itemValue),
  [Op.notIn]: (itemValue: any, value: any) => !value.includes(itemValue),
  [Op.gt]: (itemValue: any, value: any) => itemValue > value,
  [Op.gte]: (itemValue: any, value: any) => itemValue >= value,
  [Op.lt]: (itemValue: any, value: any) => itemValue < value,
  [Op.lte]: (itemValue: any, value: any) => itemValue <= value,
  [Op.between]: (itemValue: any, value: any) =>
    itemValue >= value[0] && itemValue <= value[1]
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

export function filter(data: any[], where: Filter): any[] {
  return data.filter(item => evaluateWhere(item, where));
}
