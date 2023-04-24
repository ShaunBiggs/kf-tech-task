export type EnvironmentVariable = 'SITE_ID' | 'FILTER_BEFORE_DATE';

export const getEnvironmentVariable = (variableName: EnvironmentVariable) => {
  const value = process.env[variableName];
  if (!value) {
    const errorMessage = `Missing environment variable ${variableName}`;
    console.error(errorMessage);
    throw Error(errorMessage);
  }
  return value;
};
