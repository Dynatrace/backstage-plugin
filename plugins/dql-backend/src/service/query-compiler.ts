export function compileDqlQuery(
  queryToCompile: string,
  variables: Record<string, unknown>,
): string {
  return Array.from(Object.entries(variables)).reduce(
    (query: string, [variable, value]) =>
      query.replaceAll(`\${${variable}}`, String(value)),
    queryToCompile,
  );
}
