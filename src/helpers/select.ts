import { SelectQueryAttribute } from '../types/query';

export function selectAttributes(
  attributes: SelectQueryAttribute[],
  allRows: any[]
): any[] {
  return allRows.map((row: any) => {
    return attributes.reduce((acc: any, attribute: string | [string, string]) => {
      if (typeof attribute === 'string') {
        acc[attribute] = row[attribute];
      }
      if (Array.isArray(attribute)) {
        const [currentName, newName] = attribute as [string, string];
        acc[newName] = row[currentName];
      }
      return acc;
    }, {} as any);
  });
}