export const getEnvVar = (envVarKey: string, errorMsg: string): string => {
    if (!process.env[envVarKey]) throw new Error(`Couldn't find env var ${envVarKey}\n${errorMsg}`);
    return process.env[envVarKey]!;
}