import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { eq } from 'drizzle-orm';
import { isAddress, formatEther, formatUnits } from 'ethers';
import { AppConfigI, appKey } from 'src/configs/app.config';
import { db } from 'src/configs/database';
import { accounts } from 'src/entities';
import { RedisService } from 'src/services/redis/redis.service';

interface EtherscanResponse {
  status: string;
  message: string;
  result: string;
}

@Injectable()
export class EthService {
  private readonly baseURL = 'https://api.etherscan.io/v2/api';
  private readonly logger = new Logger(EthService.name);

  constructor(
    private readonly appConfig: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  private async callEthScan(
    params: Record<string, string>,
  ): Promise<EtherscanResponse> {
    try {
      const config = this.appConfig.getOrThrow<AppConfigI>(appKey);

      if (!config.etherScanApiKey) {
        throw new Error('No api key found');
      }

      const response: AxiosResponse<EtherscanResponse> = await axios.get(
        this.baseURL,
        {
          params: {
            ...params,
            chainId: 1,
            apiKey: config.etherScanApiKey,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  }

  async get(address: string) {
    if (!isAddress(address)) {
      throw new Error('Address is not valid');
    }

    const cachedKey = `eth:account:${address.toLowerCase()}`;

    const cached = await this.redisService.get(cachedKey);

    if (cached) {
      return { ...cached, cached: true };
    }

    const [balanceWei, blockNumber, gasPriceWei]: [
      EtherscanResponse,
      EtherscanResponse,
      EtherscanResponse,
    ] = await Promise.all([
      this.callEthScan({
        module: 'account',
        action: 'balance',
        address,
        tag: 'latest',
      }),
      this.callEthScan({
        module: 'proxy',
        action: 'eth_blockNumber',
      }),
      this.callEthScan({
        module: 'proxy',
        action: 'eth_gasPrice',
      }),
    ]);

    const dataToCache = {
      balance: formatEther(balanceWei.result),
      blockNumber: blockNumber.result,
      gasPrice: formatUnits(gasPriceWei.result, 'gwei'),
    };

    await this.redisService.set(cachedKey, dataToCache, 3600);

    const normalizedAddress = address.toLowerCase();

    const accountExist = await db
      .select()
      .from(accounts)
      .where(eq(accounts.address, normalizedAddress))
      .limit(1);

    if (accountExist.length === 0) {
      await db.insert(accounts).values({
        address: normalizedAddress,
        balance: formatEther(balanceWei.result),
      });
      this.logger.log('created account');
    }

    return {
      balance: formatEther(balanceWei.result),
      blockNumber: blockNumber.result,
      gasPrice: formatUnits(gasPriceWei.result, 'gwei'),
      cached: false,
    };
  }
}
