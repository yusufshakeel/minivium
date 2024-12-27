export function columnsViolatingUniqueConstraint(
  singleData: any,
  allData: any[],
  uniqueColumnNames: string[]
): string[] {
  let columnsToCheck = 0;
  const filteredSingleDataByUniqueColumns = Object.entries(singleData)
    .reduce((acc, curr) => {
      const [column, value] = curr;
      if (uniqueColumnNames.includes(column)) {
        columnsToCheck++;
        return { ...acc, [column]: value };
      }
      return acc;
    }, {} as any);

  let violatingCount = 0;
  const violatingColumns: any = [];
  for (let i = 0; i < allData.length && violatingCount < columnsToCheck; i++) {
    const curr = allData[i];
    for (const column in filteredSingleDataByUniqueColumns) {
      if (curr[column] === filteredSingleDataByUniqueColumns[column]) {
        violatingCount++;
        violatingColumns.push(column);
      }
    }
  }

  return violatingColumns;
}