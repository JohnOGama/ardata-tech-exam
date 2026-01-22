import { registerAs } from '@nestjs/config';

export const appKey = 'appKey';

export interface AppConfigI {
  etherScanApiKey: string;
}

const appConfigFactory = (): AppConfigI => ({
  etherScanApiKey: process.env.ETHERS_SCAN_API_KEY!,
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export default registerAs(appKey, appConfigFactory);
