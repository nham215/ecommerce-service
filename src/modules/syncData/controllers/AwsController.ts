import { Controller, Get } from '@nestjs/common';
import { AwsService } from '../services/AwsService';

@Controller('aws')
export class AwsController {
  constructor(private awservice: AwsService) {}

  @Get()
  async getAccess() {
    return await this.awservice.getOrder();
  }
}
