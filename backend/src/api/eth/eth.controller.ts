import { Controller, Get, Query } from '@nestjs/common';
import { EthService } from './eth.service';

@Controller('eth')
export class EthController {
  constructor(private readonly ethService: EthService) {}

  @Get('account')
  async get(@Query('address') address: string) {
    return this.ethService.get(address);
  }
}
