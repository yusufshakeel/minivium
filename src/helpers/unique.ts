export function columnsViolatingUniqueConstraint(
  allRows: any[],
  uniqueColumnNames: string[]
): string[] {
  // do nothing when there are no unique columns
  // or when there is only one row
  if (!uniqueColumnNames.length || allRows.length === 1) {
    return [];
  }

  const duplicates: Set<string> = new Set();

  // Create a map to track value occurrences for each column
  const valueMaps: Record<string, Set<string | number>> = {};

  // Initialize sets for each column
  uniqueColumnNames.forEach(column => valueMaps[column] = new Set());

  // Iterate through the data and check for duplicates
  for (const row of allRows) {
    for (const column of uniqueColumnNames) {
      const value = row[column];
      if (valueMaps[column].has(value)) {
        duplicates.add(column); // Mark column as having duplicates
      } else {
        valueMaps[column].add(value);
      }
      if (duplicates.size === uniqueColumnNames.length) {
        return Array.from(duplicates);
      }
    }
  }

  // Return an array of column names with duplicates or an empty array
  return Array.from(duplicates);
}